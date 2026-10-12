import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  LuCircleAlert,
  LuCircleCheckBig,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import {
  useGetTransactionsQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from "../services/api";
import { currencyFormatter, formatDate } from "../utils/formatTransaction";
import type { Transaction } from "../types/transaction";

export default function Dashboard() {
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useGetTransactionsQuery();

  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteTransactionMutation();

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const [deleting, setDeleting] = useState<Transaction | null>(null);

  if (isLoading) return <Loader />;

  if (isError) {
    return <Alert color="red">Failed to load transactions.</Alert>;
  }

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setEditDescription(transaction.description);
    setEditError("");
  };

  const closeEdit = () => {
    if (isUpdating) return;
    setEditing(null);
    setEditDescription("");
    setEditError("");
  };

  const openDelete = (transaction: Transaction) => {
    setDeleting(transaction);
  };

  const closeDelete = () => {
    if (isDeleting) return;
    setDeleting(null);
  };

  const handleEdit = async () => {
    if (!editing?.id) return;

    const trimmed = editDescription.trim();

    if (!trimmed) {
      setEditError("Description is required.");
      return;
    }

    if (trimmed === editing.description) {
      closeEdit();
      return;
    }

    try {
      await updateTransaction({
        id: editing.id,
        description: trimmed,
      }).unwrap();

      notifications.show({
        title: "Transaction updated",
        message: "The transaction was updated successfully.",
        color: "green",
        icon: <LuCircleCheckBig size={18} />,
      });

      setEditing(null);
      setEditDescription("");
      setEditError("");
    } catch (error) {
      console.error("Update failed", error);

      notifications.show({
        title: "Update failed",
        message: "Could not update the transaction.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleting?.id) return;

    try {
      await deleteTransaction(deleting.id).unwrap();

      notifications.show({
        title: "Transaction deleted",
        message: "The transaction was deleted successfully.",
        color: "green",
        icon: <LuCircleCheckBig size={18} />,
      });

      setDeleting(null);
    } catch (error) {
      console.error("Delete failed", error);

      notifications.show({
        title: "Delete failed",
        message: "Could not delete the transaction.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  return (
    <>
      {" "}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Source bank</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {transactions.map((transaction) => (
            <Table.Tr
              key={
                transaction.id ??
                `${transaction.date}-${transaction.description}`
              }
            >
              <Table.Td>{formatDate(transaction.date)}</Table.Td>

              <Table.Td>
                <Text fw={500}>{transaction.description}</Text>
                {transaction.notes && (
                  <Text size="xs" c="dimmed">
                    {transaction.notes}
                  </Text>
                )}
              </Table.Td>

              <Table.Td>
                <Text size="sm">{transaction.sourceBank || "—"}</Text>
              </Table.Td>

              <Table.Td>
                <Text fw={600} c={transaction.amount < 0 ? "red" : "teal"}>
                  {transaction.amount < 0 ? "−" : "+"}
                  {currencyFormatter.format(Math.abs(transaction.amount))}
                </Text>
              </Table.Td>

              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => openEdit(transaction)}
                    aria-label="Edit transaction"
                  >
                    <LuPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => openDelete(transaction)}
                    aria-label="Delete transaction"
                  >
                    <LuTrash2 size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}

          {transactions.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5}>No transactions found.</Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <Modal
        opened={editing !== null}
        onClose={closeEdit}
        title="Edit transaction"
        centered
        closeOnClickOutside={!isUpdating}
        closeOnEscape={!isUpdating}
      >
        <Stack gap="md">
          <TextInput
            label="Description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.currentTarget.value)}
            disabled={isUpdating}
            error={editError}
            data-autofocus
          />

          {editing && (
            <Text size="sm" c="dimmed">
              Date: {formatDate(editing.date)} · Amount:{" "}
              {currencyFormatter.format(Math.abs(editing.amount))}
            </Text>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdit} disabled={isUpdating}>
              Cancel
            </Button>

            <Button onClick={handleEdit} loading={isUpdating}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={deleting !== null}
        onClose={closeDelete}
        title="Delete transaction"
        centered
        closeOnClickOutside={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <Stack gap="md">
          <Alert
            color="red"
            variant="light"
            icon={<LuCircleAlert size={18} />}
            title="This action cannot be undone"
          >
            <Stack gap={4}>
              <Text size="sm">
                You are about to delete the following transaction:
              </Text>
              {deleting && (
                <>
                  <Text size="sm" fw={500}>
                    {deleting.description}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Date: {formatDate(deleting.date)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Amount:{" "}
                    {currencyFormatter.format(Math.abs(deleting.amount))}
                  </Text>
                </>
              )}
            </Stack>
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>

            <Button color="red" onClick={handleDelete} loading={isDeleting}>
              Delete transaction
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
