'use client';
import React, {
    createContext,
    useReducer,
    useCallback,
    useEffect,
} from 'react';
import axiosInstance from '@/utils/axios-instance';
import {toast} from 'react-hot-toast';
import {
    setItem,
    removeItem,
    setJsonItem,
    getJsonItem,
    getItem,
} from '@/utils/storage';
import {redirect, useRouter, usePathname } from 'next/navigation';
import {CONTEXT_ACTION} from '@/core/dto/enums/context-action';
import ErrorEvent = google.maps.ErrorEvent;
import {undefined} from 'zod';
import {signIn} from 'next-auth/react';
import {da, ro} from 'date-fns/locale';
import {useLocation} from 'react-use';
import Cookies from 'js-cookie';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from '@/store/store';
import {SEND_OTP_SCENARIOS} from "@/core/dto/enums/send-otp-scenarios";
import {handleFormikError} from "@/utils/handle-formik-error";
import {
    CaptchaPayload,
    CAPTCHA_ERROR,
    extractAuthErrorMeta,
    withCaptchaPayload,
} from "@/utils/auth-captcha";

const initialState = {
    user: null,
    token: '',
    isLoggedIn: false,
};

export const AuthContext = createContext(null);

const authReducer = (
    state: any,
    action: { type: any; payload: { token: any; user: any } }
) => {
    let token;
    switch (action.type) {
        case CONTEXT_ACTION.CHECK_LOGIN_STATUS:
            token = Cookies.get('fkToken') || !getItem('token')
            console.log("Checking login status: ", !!token)
            if (!token) {
                console.log("Logging out user")
                removeItem('token');
                removeItem('user');
                Cookies.remove('token');
                Cookies.remove('token', {secure: true, httpOnly: false});
                Cookies.remove('jwtToken');
                Cookies.remove('jwtToken', {secure: true, httpOnly: true});
                Cookies.remove('fkToken', {secure: true, httpOnly: false, sameSite: "strict"});
                return {
                    ...state,
                    isLoggedIn: false,
                    user: initialState.user,
                    token: initialState.token,
                };
            }
            console.log("User is logged in")
            return {
                ...state,
                isLoggedIn: (token && !!getItem('token')) || !!initialState.token,
            };
        case CONTEXT_ACTION.SET_ACCESS_TOKEN:
            token = action.payload;
            if (!token)
                return {...state, isLoggedIn: false, token: initialState.token};
            setItem('token', action.payload);
            Cookies.set('fkToken', action.payload, {secure: true, httpOnly: false, sameSite: "strict"}); // TODO: In production, set to true
            // Cookies.set('jwtToken', action.payload, { secure: true, httpOnly: false, sameSite: "none" }); // TODO: This is a temporary fix

            return {...state, isLoggedIn: true, token: action.payload};
        case CONTEXT_ACTION.LOGOUT:
            removeItem('token');
            removeItem('user');
            // Cookies.remove('token');
            Cookies.remove('token', {secure: true, httpOnly: false});
            Cookies.remove('jwtToken');
            Cookies.remove('jwtToken', {secure: true, httpOnly: true});
            Cookies.remove('fkToken', {secure: true, httpOnly: false, sameSite: "strict"});
            return {
                ...state,
                isLoggedIn: false,
                user: initialState.user,
                token: initialState.token,
            };
        case CONTEXT_ACTION.SET_USER:
            setJsonItem('user', action.payload);
            return {...state, user: action.payload};
        // case 'SET_TOKEN':
        //     return { ...state, token: action.payload };
        default:
            return state;
    }
};

// @ts-ignore
export const AuthProvider = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialState, (initial) => {
        const savedToken = getItem('token') || initialState.token;
        const savedUser = getJsonItem('user');
        return {
            ...initial,
            user: savedUser || initialState.user,
            token: savedToken,
            isLoggedIn: Boolean(savedToken),
        };
    });
    const router = useRouter();
    const pathname = usePathname()

    useEffect(() => {
        const token = Cookies.get('fkToken');
        if (token)
            // @ts-ignore
            dispatch({type: 'SET_ACCESS_TOKEN', payload: token});
    }, []);

    useEffect(() => {
        const checkPathName = () => {
            console.log("Path Name: " + pathname)
            let token = Cookies.get('fkToken')
            console.log("User token: " + token)
            let localToken = getItem('token');
            if (!token && !localToken) {
                if (pathname !== '/login' && pathname !== '/sign-up' && pathname !== '/forgot-password') {
                    console.log("User not logged in, redirecting to login");
                    router.replace('/login');
                }
                console.log("User not logged in, redirecting to login");
            } else if ((token || localToken) && pathname === '/login') {
                console.log("User logged in, redirecting to dashboard");
                router.push('/');
            }
        }
        checkPathName()
    }, [pathname]);

    // useEffect(() => {
    //     console.log("Checking whether user is logged in or not");
    //     if (state.isLoggedIn) {
    //         console.log("User logged in, redirecting to dashboard");
    //         router.push('/');
    //     }
    // }, [state.isLoggedIn]);
    //
    // useEffect(() => {
    //     const refreshTokens = async () => {
    //         try {
    //             const token = Cookies.get('fkToken');
    //             if (!token) {
    //                 dispatch({ type: CONTEXT_ACTION.LOGOUT });
    //                 return;
    //             }
    //
    //             const response = await axiosInstance.get('/auth/refresh', {
    //                 headers: { 'Content-Type': 'application/json' },
    //             });
    //
    //             if (response.status === 200) {
    //                 dispatch({
    //                     type: CONTEXT_ACTION.SET_ACCESS_TOKEN,
    //                     payload: response.data.token,
    //                 });
    //                 Cookies.set('fkToken', response.data.token, { secure: true, httpOnly: false });
    //             } else {
    //                 dispatch({ type: CONTEXT_ACTION.LOGOUT });
    //             }
    //         } catch (error) {
    //             dispatch({ type: CONTEXT_ACTION.LOGOUT });
    //         }
    //     };
    //
    //     refreshTokens();
    // }, []);

    const login = useCallback(async (username: any, password: any, m: any, captcha?: CaptchaPayload | null) => {
        try {
            const response = await axiosInstance.post(
                '/auth/login',
                withCaptchaPayload({ username, password }, captcha)
            );
            const data = response.data;
            // const data = await signIn('credentials', {
            //     username: username, password: password,
            // });
            if (data) {
                console.log(data);
                // @ts-ignore
                dispatch({
                    type: CONTEXT_ACTION.SET_ACCESS_TOKEN,
                    payload: data.data?.token,
                });
                // @ts-ignore
                dispatch({type: CONTEXT_ACTION.SET_USER, payload: data.data?.user});
                toast.success('با موفقیت وارد شدید');
                m.token = data.data?.token;
                m.user = data.data?.user;
                router.push('/');
                return { success: true };
            } // @ts-ignore
            else throw new Error(data?.message || 'خطا در ورود');
        } catch (error) {
            console.error('Login failed:', error);
            const meta = extractAuthErrorMeta(error);
            toast.error(meta.message || 'خطا در ورود');
            return { success: false, ...meta };
        }
    }, []);

    const signUp = useCallback(async (username: any, email: any, firstName: any, lastName: any, password: any, otp: any, m: any, setError: any, captcha?: CaptchaPayload | null) => {
        try {
            console.log('SignUp called with:', { username, email, firstName, lastName, password: '***', otp: '***' });
            const payload = withCaptchaPayload({
                username,
                phone: username,
                password,
                email,
                firstName,
                lastName,
                otp
            }, captcha);
            console.log('Sending to API:', { ...payload, password: '***', otp: '***' });
            const response = await axiosInstance.post('/auth/register', payload);
            const data = response.data;
            // const data = await signIn('credentials', {
            //     username: username, password: password,
            // });
            if (data) {
                console.log(data);
                // @ts-ignore
                dispatch({
                    type: CONTEXT_ACTION.SET_ACCESS_TOKEN,
                    payload: data.data?.token,
                });
                // @ts-ignore
                dispatch({type: CONTEXT_ACTION.SET_USER, payload: data.data?.user});
                toast.success('با موفقیت ثبت‌نام شدید');
                m.token = data.data?.token;
                m.user = data.data?.user;
                router.push('/');
                return { success: true };
            } // @ts-ignore
            else throw new Error(data?.message || 'خطا در ثبت‌نام');
        } catch (error: any) {
            console.error('Sign up failed:', error);
            const meta = extractAuthErrorMeta(error);

            if (
                meta.errorType === CAPTCHA_ERROR.RATE_LIMIT ||
                error?.response?.status === 429
            ) {
                toast.error(meta.message || 'خطا در ثبت نام');
                return { success: false, ...meta };
            }

            if (meta.errorType === CAPTCHA_ERROR.INVALID) {
                toast.error('کپچا نامعتبر');
                if (setError) {
                    setError('captchaAnswer', {
                        type: 'manual',
                        message: 'کپچا نامعتبر',
                    });
                }
                return { success: false, captchaRequired: true, ...meta };
            }
            
            // Handle 400 validation errors
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.statusCode === 400 &&
                error.response.data.error?.length
            ) {
                const errors = error.response.data.error;
                
                // If only one error, show it in toast
                if (errors.length === 1) {
                    toast.error(errors[0].message || error.response.data.message || 'خطا در ثبت نام');
                } else {
                    // Multiple errors - show main message in toast
                    toast.error(error.response.data.message || 'خطا در اعتبارسنجی اطلاعات ارسالی');
                }
                
                // Set field errors for all errors
                errors.forEach((err: { formikField: string; message: any; type?: string }) => {
                    if (err.type === CAPTCHA_ERROR.INVALID || err.formikField === 'captchaAnswer' || err.formikField === 'captchaToken') {
                        setError?.('captchaAnswer', {
                            type: 'manual',
                            message: 'کپچا نامعتبر',
                        });
                    } else if (err.formikField && err.formikField !== 'GENERAL') {
                        setError(err.formikField, {
                            type: 'manual',
                            message: err.message
                        });
                    }
                });
            } else {
                // Handle other errors
                toast.error(
                    meta.message ||
                    error?.response?.data?.message ||
                    'خطا در ثبت نام'
                );
            }
            
            return { success: false, captchaRequired: meta.captchaRequired, ...meta };
        }
    }, []);

    const loginOtp = useCallback(async (phoneNumber: string, otp: string) => {
        try {
            const response = await axiosInstance.post('/auth/verify-otp', {
                phoneNumber,
                otp,
            });
            const responseBody = response.data;
            const payload = responseBody?.data ?? responseBody;

            if (payload?.mustRegister) {
                if (!payload.registrationToken) {
                    toast.error('توکن ثبت‌نام از سرور دریافت نشد');
                    return { success: false };
                }

                toast.success('شماره موبایل با موفقیت تأیید شد');
                return {
                    success: true,
                    mustRegister: true,
                    registrationToken: payload.registrationToken as string,
                };
            }

            if (response.status >= 200 && response.status < 300 && payload?.token) {
                dispatch({type: CONTEXT_ACTION.SET_USER, payload: payload.user});
                dispatch({
                    type: CONTEXT_ACTION.SET_ACCESS_TOKEN,
                    payload: payload.token,
                });
                toast.success(responseBody?.message || 'با موفقیت وارد شدید');
                router.push('/');
                return {
                    success: true,
                    mustRegister: false,
                    token: payload.token,
                    user: payload.user,
                };
            }

            toast.error(responseBody?.message || 'پاسخ ورود نامعتبر است');
            return { success: false };
        } catch (error: any) {
            console.error('OTP login error:', error);
            toast.error(
                (error?.response?.data?.message === 'Unauthorized' &&
                    'رمز یکبارمصرف اشتباه است') ||
                error?.response?.data?.message ||
                'خطا در تایید رمز یکبارمصرف'
            );
            return { success: false };
        }
    }, [router]);

    const registerAfterOtp = useCallback(async ({
        registrationToken,
        phoneNumber,
        email,
        firstName,
        lastName,
        password,
    }: {
        registrationToken: string;
        phoneNumber: string;
        email: string;
        firstName: string;
        lastName: string;
        password: string;
    }) => {
        try {
            const response = await axiosInstance.post('/auth/register', {
                registrationToken,
                username: phoneNumber,
                phone: phoneNumber,
                phoneNumber,
                email,
                firstName,
                lastName,
                password,
            });
            const responseBody = response.data;
            const payload = responseBody?.data ?? responseBody;

            if (!payload?.token) {
                toast.error(responseBody?.message || 'پاسخ ثبت‌نام نامعتبر است');
                return { success: false };
            }

            dispatch({type: CONTEXT_ACTION.SET_USER, payload: payload.user});
            dispatch({
                type: CONTEXT_ACTION.SET_ACCESS_TOKEN,
                payload: payload.token,
            });
            toast.success(responseBody?.message || 'ثبت‌نام با موفقیت انجام شد');
            router.push('/');
            return {
                success: true,
                token: payload.token,
                user: payload.user,
            };
        } catch (error: any) {
            console.error('OTP registration failed:', error);
            const meta = extractAuthErrorMeta(error);
            const responseData = error?.response?.data;
            const validationErrors = Array.isArray(error?.response?.data?.error)
                ? error.response.data.error.filter(
                    (item: any) => item?.message
                )
                : [];
            const errorSignature = [
                responseData?.message,
                responseData?.type,
                ...validationErrors.flatMap((item: any) => [
                    item?.type,
                    item?.field,
                    item?.message,
                ]),
            ]
                .filter(Boolean)
                .join(' ')
                .toUpperCase();
            const registrationExpired =
                error?.response?.status === 410 ||
                /REGISTRATION.*TOKEN.*(EXPIRED|INVALID)/.test(errorSignature) ||
                /(EXPIRED|INVALID).*(REGISTRATION.*TOKEN)/.test(errorSignature) ||
                /(OTP|TOKEN).*(EXPIRED|منقضی|انقضا)/i.test(errorSignature) ||
                /(منقضی|انقضا).*(OTP|توکن|ثبت.?نام)/i.test(errorSignature);

            if (registrationExpired) {
                return {
                    success: false,
                    registrationExpired: true,
                    ...meta,
                };
            }

            if (validationErrors.length > 0) {
                toast.error(
                    <div dir="rtl" className="min-w-[260px] text-right">
                        <p className="mb-2 font-bold text-gray-900">
                            {error?.response?.data?.message || 'اطلاعات واردشده معتبر نیست'}
                        </p>
                        <ul className="space-y-1 text-xs leading-5 text-gray-600">
                            {validationErrors.map((item: any, index: number) => (
                                <li key={`${item.formikField || item.field}-${index}`}>
                                    • {item.message}
                                </li>
                            ))}
                        </ul>
                    </div>,
                    { duration: 8000 }
                );
                return {
                    success: false,
                    validationErrors,
                    ...meta,
                };
            }

            toast.error(
                meta.message ||
                error?.response?.data?.message ||
                'خطا در تکمیل ثبت‌نام'
            );
            return { success: false, ...meta };
        }
    }, [router]);

    const requestOtp = useCallback(async (phoneNumber: any, captcha?: CaptchaPayload | null) => {
        try {
            let response = await axiosInstance.post(
                '/auth/send-otp',
                withCaptchaPayload({ phoneNumber }, captcha)
            );
            if (response.data?.data?.blocked) {
                return { success: true, scenario: SEND_OTP_SCENARIOS.IS_BLOCKED };
            }
            toast.success('رمز یکبار مصرف با موفقیت ارسال شد');
            return {
                success: true,
                scenario: response.data?.data?.registered
                    ? SEND_OTP_SCENARIOS.REGISTERED
                    : SEND_OTP_SCENARIOS.NEED_TO_REGISTER,
            };
        } catch (error) {
            const meta = extractAuthErrorMeta(error);
            if (meta.message) {
                toast.error(meta.message);
            }
            return {
                success: false,
                scenario: SEND_OTP_SCENARIOS.ERROR,
                ...meta,
            };
        }
    }, []);

    const forgotPasswordOtp = useCallback(async (phoneNumber: any, captcha?: CaptchaPayload | null) => {
        try {
            await axiosInstance.post(
                '/auth/forgot-password/otp',
                withCaptchaPayload({ phoneNumber }, captcha)
            );
            toast.success('رمز یکبار مصرف با موفقیت ارسال شد');
            return { success: true };
        } catch (error) {
            const meta = extractAuthErrorMeta(error);
            toast.error(meta.message || 'خطا در ارسال رمز یکبار مصرف');
            return { success: false, ...meta };
        }
    }, []);

    const forgotPasswordVerify = useCallback(
        async (otp: any, phoneNumber: any) => {
            try {
                const response = await axiosInstance.post('/auth/forgot-password/verify', {
                    otp,
                    phoneNumber,
                });
                const resetToken = response.data?.data?.resetToken;
                if (!resetToken) {
                    toast.error('توکن بازنشانی رمز عبور از سرور دریافت نشد');
                    return null;
                }
                return resetToken as string;
            } catch (error) {
                console.log(error);
                // @ts-ignore
                toast.error(
                    error?.response?.data?.message || 'خطا در بررسی رمز یکبارمصرف'
                );
                return null;
            }
        },
        []
    );

    const forgotPassword = useCallback(
        async (password: any, username: any, resetToken: string, formHook?: { setFieldError?: (field: string, message: string) => void }) => {
            try {
                const response = await axiosInstance.post('/auth/forgot-password', {
                    password,
                    username,
                    resetToken,
                });
                if (response?.data?.status === 'SUCCESS') {
                    toast.success(response.data.message);
                    router.push('/login');
                } else
                    toast.error(response?.data?.message || 'خطا در بازنشانی رمزعبور');
            } catch (error: any) {
                console.log(
                    'Error in forgotPassword' + JSON.stringify(error.response?.data)
                );
                if (
                    error.response &&
                    error.response.status === 400 &&
                    error.response.data.statusCode === 400 &&
                    error.response.data.error?.length
                ) {
                    toast.error(error.response.data.message);
                    error.response.data.error.forEach(
                        (err: { formikField: string; message: any }) => {
                            if (err.formikField !== 'GENERAL')
                                formHook?.setFieldError?.(err.formikField, err.message);
                        }
                    );
                } else {
                    toast.error('خطا در بازنشانی رمز عبور');
                }
                // throw error;
            }
        },
        []
    );
    const isLoggedIn = useCallback(
        () => {
            return Boolean(Cookies.get("fkToken") || getItem("token"))
        },
        []
    );
    const fixToken = useCallback(
        () => {
            let token = Cookies.get("fkToken") || getItem('token');
            Cookies.set("fkToken", token);
            setItem("token", token);
        },
        []
    );

    const changePassword = useCallback(
        async (
            oldPassword: any,
            newPassword: any,
            confirmNewPassword: any,
            formHook: any
        ) => {
            try {
                const response = await axiosInstance.post('/auth/change-password', {
                    oldPassword,
                    newPassword,
                    confirmNewPassword,
                });
                if (response?.data?.status === 'SUCCESS')
                    toast.success(response.data.message || 'خطا در تغییر رمزعبور');
            } catch (error: any) {
                toast.error('Password change failed');
                console.log(JSON.stringify(error.response?.data));
                if (
                    error.response &&
                    error.response.status === 400 &&
                    error.response.data.statusCode === 400 &&
                    error.response.data.error?.length
                ) {
                    toast.error(error.response.data.message);
                    error.response.data.error.forEach(
                        (err: { formikField: string; message: any }) => {
                            if (err.formikField !== 'GENERAL')
                                formHook.setFieldError(err.formikField, err.message);
                        }
                    );
                } else {
                    toast.error('خطا در تغییر رمز عبور');
                }
                // throw error;
            }
        },
        []
    );

    const logout = useCallback(() => {
        // removeItem('token');
        // removeItem('user');
        // dispatch({
        //     type: 'LOGOUT',
        //     payload: {
        //         token: undefined,
        //         user: undefined
        //     }
        // });
        dispatch({
            payload: {token: undefined, user: undefined},
            type: CONTEXT_ACTION.LOGOUT,
        });
        router.replace('/login');
    }, []);

    // const location = useLocation();
    // // useEffect(() => {
    // //     if (state.isLoggedIn) router.push('/');
    // //     else router.replace('/login');
    // // }, [state.isLoggedIn]);
    // // useEffect(() => {
    // //     dispatch({payload: {token: undefined, user: undefined}, type: CONTEXT_ACTION.CHECK_LOGIN_STATUS });
    // // }, [location]);
    // @ts-ignore
    return (
        // @ts-ignore
        <AuthContext.Provider
            value={{
                state,
                login,
                loginOtp,
                registerAfterOtp,
                requestOtp,
                changePassword,
                logout,
                dispatch,
                forgotPasswordOtp,
                forgotPasswordVerify,
                forgotPassword,
                signUp,
                isLoggedIn,
                fixToken
            }}
        >
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    {children}
                </PersistGate>
            </Provider>
        </AuthContext.Provider>
    );
};
export const useAuth = () => React.useContext(AuthContext);
