import { useState } from "react";
import { Alert, Button, FileInput, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { LuCircleAlert, LuCircleCheckBig, LuUpload } from "react-icons/lu";
import { useUploadTransactionsMutation } from "../services/api";

export const FileUpload = ({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);

  const [uploadTransactions, { isLoading, error }] =
    useUploadTransactionsMutation();

  const handleUpload = async () => {
    if (!file) return;

    try {
      await uploadTransactions(file).unwrap();

      notifications.show({
        title: "Upload successful",
        message: "Your transactions have been imported.",
        color: "green",
        icon: <LuCircleCheckBig size={18} />,
      });

      setFile(null);
      onUploadSuccess();
    } catch (error) {
      console.error("Upload failed", error);

      notifications.show({
        title: "Upload failed",
        message: "Something went wrong while importing your transactions.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  return (
    <Stack gap="sm">
      <FileInput
        label="Transaction CSV"
        placeholder="Choose a CSV file"
        accept=".csv"
        value={file}
        onChange={setFile}
        clearable
      />

      <Button
        leftSection={<LuUpload size={16} />}
        onClick={handleUpload}
        disabled={!file}
        loading={isLoading}
      >
        Import CSV
      </Button>

      {error && (
        <Alert color="red" variant="light" icon={<LuCircleAlert size={18} />}>
          Upload failed. Please check your CSV file and try again.
        </Alert>
      )}

      {file && !error && (
        <Text size="sm" c="dimmed">
          Selected: {file.name}
        </Text>
      )}
    </Stack>
  );
};
