import type { AxiosInstance } from 'axios';

export async function uploadTicketMessageAttachments(
  client: Pick<AxiosInstance, 'post'>,
  messageId: string,
  files: File[]
): Promise<File[]> {
  const failed: File[] = [];
  for (const file of files) {
    const payload = new FormData();
    payload.append('file', file);
    try {
      const response = await client.post(
        `/ticket/messages/${messageId}/attachments`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        }
      );
      if (response.data.status !== 'SUCCESS') failed.push(file);
    } catch {
      failed.push(file);
    }
  }
  return failed;
}
