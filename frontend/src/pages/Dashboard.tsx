import { Alert, Loader, Table, Text } from "@mantine/core";
import { useGetTransactionsQuery } from "../services/api";
import { currencyFormatter, formatDate } from "../utils/formatTransaction";

export default function Dashboard() {
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useGetTransactionsQuery();

  if (isLoading) return <Loader />;

  if (isError) {
    return <Alert color="red">Failed to load transactions.</Alert>;
  }

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Source bank</Table.Th>
          <Table.Th>Amount</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {transactions.map((transaction) => (
          <Table.Tr
            key={
              transaction.id ?? `${transaction.date}-${transaction.description}`
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
          </Table.Tr>
        ))}

        {transactions.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={5}>No transactions found.</Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
