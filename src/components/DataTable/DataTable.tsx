import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import type { DataTableProps } from "./DataTable.types";
import "./DataTable.css";

function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  actions = [],
  emptyMessage = "No hay datos disponibles",
  stickyHeader = false,
  maxHeight,
}: DataTableProps<T>) {
  const hasActions = actions.length > 0;

  const getCellValue = (row: T, key: string): unknown => {
    return (row as Record<string, unknown>)[key];
  };

  return (
    <TableContainer
      component={Paper}
      className="data-table"
      sx={maxHeight ? { maxHeight } : undefined}
    >
      <Table stickyHeader={stickyHeader} size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={String(col.key)}
                align={col.align ?? "left"}
                width={col.width}
                className="data-table__head-cell"
              >
                {col.header}
              </TableCell>
            ))}
            {hasActions && (
              <TableCell
                align="center"
                className="data-table__head-cell"
                width={120}
              >
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                align="center"
              >
                <Typography
                  variant="body2"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover className="data-table__row">
                {columns.map((col) => {
                  const value = getCellValue(row, String(col.key));
                  return (
                    <TableCell
                      key={String(col.key)}
                      align={col.align ?? "left"}
                      className="data-table__cell"
                    >
                      {col.renderCell
                        ? col.renderCell(value, row)
                        : String(value ?? "")}
                    </TableCell>
                  );
                })}
                {hasActions && (
                  <TableCell
                    align="center"
                    className="data-table__cell data-table__cell--actions"
                  >
                    {actions.map((action, i) => (
                      <Tooltip key={i} title={action.label} arrow>
                        <span>
                          <IconButton
                            size="small"
                            color={action.color ?? "default"}
                            onClick={() => action.onClick(row)}
                            disabled={
                              action.disabled ? action.disabled(row) : false
                            }
                            aria-label={action.label}
                          >
                            {action.icon}
                          </IconButton>
                        </span>
                      </Tooltip>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
