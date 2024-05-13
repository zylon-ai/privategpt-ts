import { PrivategptApi, PrivategptApiClient } from 'privategpt-sdk-utils';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

type UseFilesArgs = {
  fetchFiles?: boolean;
  client: PrivategptApiClient;
};
export const useFiles = ({ client, fetchFiles = false }: UseFilesArgs) => {
  const getFiles = async () => {
    const response = await client.ingestion.listIngested();
    const files = response.data.reduce(
      (acc, file) => {
        const name = file.docMetadata?.file_name as string;
        const parent = acc.find((f) => f.fileName === name);
        if (parent) {
          parent.docs.push(file);
          return acc;
        }
        return [
          ...acc,
          {
            fileName: name,
            docs: [file],
          },
        ];
      },
      [] as Array<{
        fileName: string;
        docs: PrivategptApi.IngestedDoc[];
      }>,
    );
    return files;
  };
  const {
    data: files,
    isLoading: isFetchingFiles,
    mutate: refetch,
    error: errorFetchingFiles,
  } = useSWR(['files'], fetchFiles ? getFiles : null);

  const uploadFile = async (_: string, { arg }: { arg: File }) => {
    const response = await client.ingestion.ingestFile(arg);
    return response.data;
  };
  const {
    trigger: addFile,
    isMutating: isUploadingFile,
    error: errorUploadingFile,
  } = useSWRMutation('uploadFile', uploadFile, {
    onSuccess: () => {
      refetch();
    },
  });

  const deleteFileFn = async (_: string, { arg }: { arg: string }) => {
    if (!files) return;
    const parent = files.find((f) => f.fileName === arg);
    if (!parent) return;
    for (const doc of parent.docs) {
      await client.ingestion.deleteIngested(doc.docId);
    }
  };
  const {
    trigger: deleteFile,
    isMutating: isDeletingFile,
    error: errorDeletingFile,
  } = useSWRMutation('deleteFile', deleteFileFn, {
    onSuccess: () => {
      refetch();
    },
  });
  return {
    addFile,
    isUploadingFile,
    isDeletingFile,
    files,
    deleteFile,
    isFetchingFiles,
    errorDeletingFile,
    errorFetchingFiles,
    errorUploadingFile,
  };
};
