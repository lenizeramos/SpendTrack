import { useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  FileInput,
  Stack,
  Text,
  Modal,
  Group,
  Title,
  Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { LuCircleAlert, LuCircleCheckBig, LuUpload } from "react-icons/lu";
import { useUploadTransactionsMutation } from "../services/api";
import type {
  DuplicateTransaction,
  ImportTransactionsResult,
} from "../types/transaction";

export const FileUpload = ({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [opened, setOpened] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateTransaction[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [uploadTransactions, { isLoading }] = useUploadTransactionsMutation();

  const finishImport = (result: ImportTransactionsResult) => {
    const imported = result.importedCount;
    const skipped = result.skippedCount;

    const message =
      `${imported} transaction${imported === 1 ? "" : "s"} imported successfully.` +
      (skipped > 0
        ? ` ${skipped} transaction${skipped === 1 ? "" : "s"} skipped.`
        : "");

    notifications.show({
      title: "Import completed",
      message,
      color: "green",
      icon: <LuCircleCheckBig size={18} />,
    });

    setOpened(false);
    setDuplicates([]);
    setSelectedIndexes([]);
    setFile(null);
    setUploadError("");
    onUploadSuccess();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadError("");

    try {
      const result = await uploadTransactions({ file }).unwrap();

      if (result.requiresConfirmation) {
        const foundDuplicates = result.duplicates ?? [];

        setDuplicates(foundDuplicates);

        setSelectedIndexes([]);

        setOpened(true);
        return;
      }

      finishImport(result);
    } catch (error) {
      const response = error as {
        status?: number;
        data?: ImportTransactionsResult;
      };

      if (response.status === 409 && response.data?.requiresConfirmation) {
        setTotalCount(response.data.totalCount);
        setDuplicates(response.data.duplicates ?? []);
        setSelectedIndexes([]);
        setOpened(true);
        return;
      }

      console.error("Upload failed", error);

      setUploadError(
        "Upload failed. Please check your CSV file and try again.",
      );
    }
  };

  const handleConfirm = async () => {
    if (!file) return;

    setUploadError("");

    try {
      const excludedIndexes = duplicates
        .filter((item) => !selectedIndexes.includes(item.index))
        .map((item) => item.index);

      const result = await uploadTransactions({
        file,
        confirmImport: true,
        excludedIndexes,
      }).unwrap();

      finishImport(result);
    } catch (error) {
      console.error("Import failed", error);

      notifications.show({
        title: "Import failed",
        message: "Could not import the selected transactions.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  const toggleIndex = (index: number, checked: boolean) => {
    setSelectedIndexes((current) =>
      checked
        ? current.includes(index)
          ? current
          : [...current, index]
        : current.filter((item) => item !== index),
    );
  };

  return (
    <Paper withBorder p="lg" radius="md">
      <Stack gap="sm">
        <Title order={2}>Import Transactions</Title>
        <FileInput
          label="Transaction CSV"
          placeholder="Choose a CSV file"
          accept=".csv"
          value={file}
          onChange={setFile}
          clearable
          disabled={isLoading}
        />

        <Button
          leftSection={<LuUpload size={16} />}
          onClick={handleUpload}
          disabled={!file || isLoading}
          loading={isLoading}
        >
          Import CSV
        </Button>

        {uploadError && (
          <Alert color="red" variant="light" icon={<LuCircleAlert size={18} />}>
            {uploadError}
          </Alert>
        )}

        {file && (
          <Text size="sm" c="dimmed">
            Selected: {file.name}
          </Text>
        )}

        <Modal
          opened={opened}
          onClose={() => {
            if (!isLoading) setOpened(false);
          }}
          title="Review before importing"
          centered
          size="lg"
          closeOnClickOutside={!isLoading}
          closeOnEscape={!isLoading}
        >
          <Stack gap="md">
            <Text size="sm">
              Your CSV file contains <strong>{totalCount} transactions</strong>.
              We found <strong>{duplicates.length}</strong> that already exist
              in your database.
            </Text>

            <Alert
              color="blue"
              variant="light"
              title="Your file has not been imported yet"
            >
              <Stack gap={4}>
                <Text size="sm">
                  The transactions listed below are the ones that already exist
                  in your database. Select any transaction you want to import
                  again. Unselected transactions will be skipped.
                </Text>
                <Text size="sm" mt="sm" fw={500}>
                  When you're ready, click "Import transactions" to upload the
                  file and save your changes.{" "}
                  <strong>
                    You must click this button to complete the import, even if
                    you don't select any transactions.
                  </strong>
                </Text>
              </Stack>
            </Alert>

            <Text size="sm" fw={600}>
              Transactions already in your database
            </Text>

            <Stack gap="sm">
              {duplicates.map(({ index, transaction, reason }) => (
                <Alert
                  key={index}
                  color="yellow"
                  variant="light"
                  icon={<LuCircleAlert size={18} />}
                >
                  <Checkbox
                    checked={selectedIndexes.includes(index)}
                    onChange={(event) =>
                      toggleIndex(index, event.currentTarget.checked)
                    }
                    label={
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>
                          {transaction.description}
                        </Text>

                        <Text size="xs" c="dimmed">
                          Date:{new Date(transaction.date).toLocaleDateString()}
                        </Text>

                        <Text size="xs" c="dimmed">
                          Amount: {transaction.amount.toFixed(2)}
                        </Text>

                        <Text size="xs" c="dimmed">
                          {reason}
                        </Text>
                      </Stack>
                    }
                  />
                </Alert>
              ))}
            </Stack>

            <Text size="sm" c="dimmed">
              {selectedIndexes.length} existing transaction(s) selected for
              import. {duplicates.length - selectedIndexes.length} will be
              skipped.
            </Text>

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => setOpened(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button onClick={handleConfirm} loading={isLoading}>
                Import transactions
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Paper>
  );
};
