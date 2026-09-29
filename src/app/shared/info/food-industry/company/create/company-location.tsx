// import { useEffect, useState } from "react";
// import { useFormContext } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import FormGroup from "@/app/shared/form-group";
// import cn from "@/utils/class-names";
// import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import dynamic from "next/dynamic";
//
// // Dynamically import MiniMap component with no SSR
// const MiniMap = dynamic(() => import("../../../../mini-map/MiniMap"), {
//     ssr: false,
//     loading: () => (
//         <div className="h-[350px] w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center dark:border-gray-300 dark:bg-gray-100">
//             <div className="animate-pulse text-gray-400">در حال بارگذاری نقشه...</div>
//         </div>
//     ),
// });
//
// export default function CompanyLocation({ className }: { className?: string }) {
//     const {
//         register,
//         formState: { errors },
//         setValue,
//         watch,
//     } = useFormContext();
//
//     const [activeTab, setActiveTab] = useState("factory");
//     const factoryAddress = watch("factoryLocation", "");
//     const officeAddress = watch("officeLocation", "");
//
//     // Set coordinates in form when address changes
//     useEffect(() => {
//         // You could add geocoding here to automatically find coordinates based on address
//     }, [factoryAddress, officeAddress]);
//
//     return (
//         <FormGroup
//             title="موقعیت مکانی"
//             description="موقعیت دقیق کارخانه و دفتر مرکزی را روی نقشه مشخص کنید"
//             className={cn(className)}
//         >
//             <Tabs
//                 value={activeTab}
//                 onValueChange={setActiveTab}
//                 className="col-span-full mb-8"
//             >
//                 <TabList className="gap-x-8 border-b border-gray-200 dark:border-gray-300">
//                     <Tab
//                         value="factory"
//                         className={cn(
//                             "capitalize py-2 px-4 -mb-px text-sm font-medium transition-colors",
//                             "text-gray-500 hover:text-gray-700",
//                             "data-[state=active]:text-blue-600",
//                             "data-[state=active]:border-b-2",
//                             "data-[state=active]:border-blue-600"
//                         )}
//                     >
//                         کارخانه
//                     </Tab>
//                     <Tab
//                         value="office"
//                         className={cn(
//                             "capitalize py-2 px-4 -mb-px text-sm font-medium transition-colors",
//                             "text-gray-500 hover:text-gray-700",
//                             "data-[state=active]:text-blue-600",
//                             "data-[state=active]:border-b-2",
//                             "data-[state=active]:border-blue-600"
//                         )}
//                     >
//                         دفتر مرکزی
//                     </Tab>
//                 </TabList>
//                 <div className="h-5" />
//
//                 <TabPanel value="factory">
//                     <div className="grid gap-6 md:grid-cols-2">
//                         <div className="space-y-6 md:col-span-1">
//                             <Input
//                                 label="استان کارخانه*"
//                                 placeholder="استان کارخانه"
//                                 {...register("factoryState")}
//                                 error={errors.factoryState?.message as string}
//                             />
//                             <Input
//                                 label="شهر کارخانه*"
//                                 placeholder="شهر کارخانه"
//                                 {...register("factoryCity")}
//                                 error={errors.factoryCity?.message as string}
//                             />
//                             <Input
//                                 label="نام شهرک صنعتی*"
//                                 placeholder="نام شهرک صنعتی"
//                                 {...register("industrialCity")}
//                                 error={errors.industrialCity?.message as string}
//                             />
//                             <Input
//                                 label="کد پستی کارخانه"
//                                 type="number"
//                                 placeholder="کد پستی کارخانه"
//                                 {...register("factoryPoBox")}
//                                 error={errors.factoryPoBox?.message as string}
//                             />
//                             <Textarea
//                                 label="آدرس کارخانه*"
//                                 placeholder="آدرس کارخانه"
//                                 {...register("factoryLocation")}
//                                 error={errors.factoryLocation?.message as string}
//                                 rows={4}
//                             />
//                         </div>
//                         <div className="md:col-span-1">
//                             <div className="h-full flex flex-col justify-between">
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1.5">
//                                         موقعیت کارخانه روی نقشه
//                                     </label>
//                                     <p className="text-xs text-gray-500 mb-3">
//                                         برای انتخاب محل دقیق، روی نقشه کلیک کنید یا آدرس را جستجو نمایید
//                                     </p>
//                                 </div>
//                                 <div className="flex-1 min-h-[350px]">
//                                     <MiniMap
//                                         className="h-full"
//                                         locationPrefix="factory"
//                                         setAddress={(address) => setValue("factoryLocation", address)}
//                                     />
//                                 </div>
//                                 <div className="flex justify-between mt-4 text-xs text-gray-500">
//                                     <span>عرض جغرافیایی: {watch("factoryLatitude") || "-"}</span>
//                                     <span>طول جغرافیایی: {watch("factoryLongitude") || "-"}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </TabPanel>
//
//                 <TabPanel value="office">
//                     <div className="grid gap-6 md:grid-cols-2">
//                         <div className="space-y-6 md:col-span-1">
//                             <Input
//                                 label="استان دفتر مرکزی"
//                                 placeholder="استان دفتر مرکزی"
//                                 {...register("officeState")}
//                                 error={errors.officeState?.message as string}
//                             />
//                             <Input
//                                 label="شهر دفتر مرکزی"
//                                 placeholder="شهر دفتر مرکزی"
//                                 {...register("officeCity")}
//                                 error={errors.officeCity?.message as string}
//                             />
//                             <Input
//                                 label="کد پستی دفتر مرکزی"
//                                 type="number"
//                                 placeholder="کد پستی دفتر مرکزی"
//                                 {...register("officePoBox")}
//                                 error={errors.officePoBox?.message as string}
//                             />
//                             <Textarea
//                                 label="آدرس دفتر مرکزی*"
//                                 placeholder="آدرس دفتر مرکزی"
//                                 {...register("officeLocation")}
//                                 error={errors.officeLocation?.message as string}
//                                 rows={4}
//                             />
//                         </div>
//                         <div className="md:col-span-1">
//                             <div className="h-full flex flex-col justify-between">
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1.5">
//                                         موقعیت دفتر مرکزی روی نقشه
//                                     </label>
//                                     <p className="text-xs text-gray-500 mb-3">
//                                         برای انتخاب محل دقیق، روی نقشه کلیک کنید یا آدرس را جستجو نمایید
//                                     </p>
//                                 </div>
//                                 <div className="flex-1 min-h-[350px]">
//                                     <MiniMap
//                                         className="h-full"
//                                         locationPrefix="office"
//                                         setAddress={(address) => setValue("officeLocation", address)}
//                                     />
//                                 </div>
//                                 <div className="flex justify-between mt-4 text-xs text-gray-500">
//                                     <span>عرض جغرافیایی: {watch("officeLatitude") || "-"}</span>
//                                     <span>طول جغرافیایی: {watch("officeLongitude") || "-"}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </TabPanel>
//             </Tabs>
//         </FormGroup>
//     );
// }

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormGroup from "@/app/shared/form-group";
import cn from "@/utils/class-names";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { PiWarningCircleBold } from "react-icons/pi";

// Dynamically import MiniMap component with no SSR
const MiniMap = dynamic(() => import("../../../../mini-map/MiniMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[350px] w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center dark:border-gray-300 dark:bg-gray-100">
            <div className="animate-pulse text-gray-400">در حال بارگذاری نقشه...</div>
        </div>
    ),
});

export default function CompanyLocation({ className }: { className?: string }) {
    const {
        register,
        formState: { errors },
        setValue,
        watch,
    } = useFormContext();

    const [activeTab, setActiveTab] = useState("factory");
    const factoryAddress = watch("factoryLocation", "");
    const officeAddress = watch("officeLocation", "");

    const locationFields = [
        { name: "factoryState", label: "استان کارخانه", tab: "factory" },
        { name: "factoryCity", label: "شهر کارخانه", tab: "factory" },
        { name: "industrialCity", label: "نام شهرک صنعتی", tab: "factory" },
        { name: "factoryPoBox", label: "کد پستی کارخانه", tab: "factory" },
        { name: "factoryLocation", label: "آدرس کارخانه", tab: "factory" },
        { name: "officeState", label: "استان دفتر مرکزی", tab: "office" },
        { name: "officeCity", label: "شهر دفتر مرکزی", tab: "office" },
        { name: "officePoBox", label: "کد پستی دفتر مرکزی", tab: "office" },
        { name: "officeLocation", label: "آدرس دفتر مرکزی", tab: "office" },
    ] as const;

    const locationErrors = locationFields.flatMap((field) => {
        const message = errors[field.name]?.message;

        return typeof message === "string" ? [{ ...field, message }] : [];
    });
    const factoryHasErrors = locationErrors.some(({ tab }) => tab === "factory");
    const officeHasErrors = locationErrors.some(({ tab }) => tab === "office");

    // Set coordinates in form when address changes
    useEffect(() => {
        // You could add geocoding here to automatically find coordinates based on address
    }, [factoryAddress, officeAddress]);

    return (
        <FormGroup
            title="موقعیت مکانی"
            description="موقعیت دقیق کارخانه و دفتر مرکزی را روی نقشه مشخص کنید"
            className={cn(className)}
        >
            <Tabs
                selectedIndex={activeTab === "factory" ? 0 : 1}
                onChange={(index) => setActiveTab(index === 0 ? "factory" : "office")}
                className="col-span-full mb-8"
            >
                <TabList className="gap-x-8 border-b border-gray-200 dark:border-gray-300">
                    <Tab
                        className={({ selected }) => cn(
                            "capitalize py-2 px-4 -mb-px text-sm font-medium transition-colors relative",
                            "text-gray-500 hover:text-gray-900 dark:hover:text-gray-700",
                            selected ? "border-b-2 border-black text-black dark:border-gray-1000 dark:text-gray-1000" : ""
                        )}
                    >
                        کارخانه
                        {factoryHasErrors && (
                            <span className="ms-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </Tab>
                    <Tab
                        className={({ selected }) => cn(
                            "capitalize py-2 px-4 -mb-px text-sm font-medium transition-colors relative",
                            "text-gray-500 hover:text-gray-900 dark:hover:text-gray-700",
                            selected ? "border-b-2 border-black text-black dark:border-gray-1000 dark:text-gray-1000" : ""
                        )}
                    >
                        دفتر مرکزی
                        {officeHasErrors && (
                            <span className="ms-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
                        )}
                    </Tab>
                </TabList>
                <div className="h-5" />

                <TabPanel>
                    <div className="grid gap-8 xl:grid-cols-2">
                        <div className="space-y-6 xl:col-span-1">
                            <Input
                                label="استان کارخانه*"
                                placeholder="استان کارخانه"
                                {...register("factoryState")}
                                error={errors.factoryState?.message as string}
                                helperText="ابتدا استان را وارد کنید تا نقشه روی همان استان قرار بگیرد."
                            />
                            <Input
                                label="شهر کارخانه*"
                                placeholder="شهر کارخانه"
                                {...register("factoryCity")}
                                error={errors.factoryCity?.message as string}
                            />
                            <Input
                                label="نام شهرک صنعتی*"
                                placeholder="نام شهرک صنعتی"
                                {...register("industrialCity")}
                                error={errors.industrialCity?.message as string}
                            />
                            <Input
                                label="کد پستی کارخانه"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="کد پستی کارخانه"
                                {...register("factoryPoBox")}
                                error={errors.factoryPoBox?.message as string}
                                helperText="(مثال: 1234567890)"
                            />
                            <Textarea
                                label="آدرس کارخانه*"
                                placeholder="آدرس کارخانه"
                                {...register("factoryLocation")}
                                error={errors.factoryLocation?.message as string}
                                rows={4}
                            />
                        </div>
                        <div className="xl:col-span-1">
                            <div className="h-full flex flex-col justify-between">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1.5">
                                        موقعیت کارخانه روی نقشه
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        برای انتخاب محل دقیق، روی نقشه کلیک کنید یا آدرس را جستجو نمایید
                                    </p>
                                </div>
                                <div className="flex-1 min-h-[350px]">
                                    <MiniMap
                                        className="h-full"
                                        locationPrefix="factory"
                                        setAddress={(address) => setValue("factoryLocation", address, { shouldDirty: true, shouldValidate: true })}
                                    />
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-gray-500">
                                    <span>عرض جغرافیایی: {watch("factoryLatitude") || "-"}</span>
                                    <span>طول جغرافیایی: {watch("factoryLongitude") || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                    <div className="grid gap-8 xl:grid-cols-2">
                        <div className="space-y-6 xl:col-span-1">
                            <Input
                                label="استان دفتر مرکزی"
                                placeholder="استان دفتر مرکزی"
                                {...register("officeState")}
                                error={errors.officeState?.message as string}
                                helperText="با وارد کردن استان، نقشه روی همان محدوده قرار می‌گیرد."
                            />
                            <Input
                                label="شهر دفتر مرکزی"
                                placeholder="شهر دفتر مرکزی"
                                {...register("officeCity")}
                                error={errors.officeCity?.message as string}
                            />
                            <Input
                                label="کد پستی دفتر مرکزی"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="کد پستی دفتر مرکزی"
                                {...register("officePoBox")}
                                error={errors.officePoBox?.message as string}
                                helperText="(مثال: 1234567890)"
                            />
                            <Textarea
                                label="آدرس دفتر مرکزی"
                                placeholder="آدرس دفتر مرکزی"
                                {...register("officeLocation")}
                                error={errors.officeLocation?.message as string}
                                rows={4}
                            />
                        </div>
                        <div className="xl:col-span-1">
                            <div className="h-full flex flex-col justify-between">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1.5">
                                        موقعیت دفتر مرکزی روی نقشه
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        برای انتخاب محل دقیق، روی نقشه کلیک کنید یا آدرس را جستجو نمایید
                                    </p>
                                </div>
                                <div className="flex-1 min-h-[350px]">
                                    <MiniMap
                                        className="h-full"
                                        locationPrefix="office"
                                        setAddress={(address) => setValue("officeLocation", address, { shouldDirty: true, shouldValidate: true })}
                                    />
                                </div>
                                <div className="flex justify-between mt-4 text-xs text-gray-500">
                                    <span>عرض جغرافیایی: {watch("officeLatitude") || "-"}</span>
                                    <span>طول جغرافیایی: {watch("officeLongitude") || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                {locationErrors.length > 0 && (
                    <div
                        role="alert"
                        aria-live="polite"
                        className="mt-6 overflow-hidden rounded-xl border border-red-200 bg-gradient-to-l from-red-50 to-orange-50 shadow-sm dark:border-red-300 dark:from-red-50 dark:to-orange-50"
                    >
                        <div className="flex gap-3 border-b border-red-200 px-5 py-4 dark:border-red-300">
                            <PiWarningCircleBold className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
                            <div>
                                <p className="font-semibold text-red-800">اطلاعات موقعیت مکانی نیاز به تکمیل دارد</p>
                                <p className="mt-1 text-sm text-red-700">
                                    برای مشاهده و اصلاح هر مورد، روی آن کلیک کنید تا زبانه مرتبط باز شود.
                                </p>
                            </div>
                        </div>
                        <ul className="grid gap-2 px-5 py-4 sm:grid-cols-2">
                            {locationErrors.map(({ name, label, message, tab }) => (
                                <li key={name} className="flex items-start gap-2 text-sm text-red-light">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className="text-right leading-6 transition-colors hover:text-red-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                    >
                                        <span className="font-semibold">{label}:</span> {message}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Tabs>
        </FormGroup>
    );
}
