import { useState, useMemo } from "react";
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
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Toolbar,
  Box,
} from "@mui/material";
import { Search, X } from "lucide-react";
import type { DataTableProps } from "./DataTable.types";
import "./DataTable.css";

const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 25];
const EMPTY_FILTERABLE_FIELDS: never[] = [];

function getCellValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function toSafeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return value;
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return value.toString();
  }
  return "";
}

function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  actions = [],
  emptyMessage = "No hay datos disponibles",
  stickyHeader = false,
  maxHeight,
  searchable = false,
  pagination = false,
  rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  filterableFields = EMPTY_FILTERABLE_FIELDS,
}: Readonly<DataTableProps<T>>) {
  const hasActions = actions.length > 0;
  const hasToolbar = searchable || filterableFields.length > 0;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleFilter = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchTerm("");
    setPage(0);
  };

  const processedRows = useMemo(() => {
    let result = [...rows];

    if (searchable && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          toSafeString(getCellValue(row, String(col.key)))
            .toLowerCase()
            .includes(lower),
        ),
      );
    }

    filterableFields.forEach((field) => {
      const selected = filterValues[String(field.key)];
      if (selected) {
        result = result.filter(
          (row) =>
            toSafeString(getCellValue(row, String(field.key))) === selected,
        );
      }
    });

    if (sortKey && sortDir) {
      result = result.slice().sort((a, b) => {
        const aVal = getCellValue(a, sortKey);
        const bVal = getCellValue(b, sortKey);
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = toSafeString(aVal).toLowerCase();
        const bStr = toSafeString(bVal).toLowerCase();
        if (aStr < bStr) return sortDir === "asc" ? -1 : 1;
        if (aStr > bStr) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    rows,
    searchable,
    searchTerm,
    columns,
    filterableFields,
    filterValues,
    sortKey,
    sortDir,
  ]);

  const paginatedRows = useMemo(() => {
    if (!pagination) return processedRows;
    return processedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [processedRows, pagination, page, rowsPerPage]);

  return (
    <Paper
      className="data-table"
      sx={{
        minHeight: 600,
        display: "flex",
        flexDirection: "column",
        ...(maxHeight ? { maxHeight } : {}),
      }}
    >
      {hasToolbar && (
        <Toolbar className="data-table__toolbar" variant="dense" disableGutters>
          {filterableFields.map((field) => (
            <FormControl
              key={String(field.key)}
              size="small"
              className="data-table__filter-select"
            >
              <div className="data-table__filter-select-inner">
                <p>Formato</p>
                <Select
                  value={filterValues[String(field.key)] ?? ""}
                  label={field.label}
                  onChange={(e) =>
                    handleFilter(String(field.key), e.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  {field.options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </FormControl>
          ))}
          <Box sx={{ flex: 1 }} />
          {searchable && !searchOpen && (
            <Tooltip title="Buscar" arrow>
              <IconButton
                size="small"
                className="data-table__search-btn"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} strokeWidth={1.5} />
              </IconButton>
            </Tooltip>
          )}
          {searchable && searchOpen && (
            <TextField
              autoFocus
              size="small"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="data-table__search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={handleSearchClose}
                    className="data-table__search-close"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </IconButton>
                ),
              }}
            />
          )}
        </Toolbar>
      )}
      <TableContainer sx={{ flex: 1 }}>
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
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortKey === String(col.key)}
                      direction={
                        sortKey === String(col.key) && sortDir ? sortDir : "asc"
                      }
                      onClick={() => handleSort(String(col.key))}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
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
            {paginatedRows.length === 0 ? (
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
              paginatedRows.map((row) => (
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
                          : toSafeString(value)}
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
      {pagination && (
        <TablePagination
          component="div"
          count={processedRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number.parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      )}
    </Paper>
  );
}

export default DataTable;
