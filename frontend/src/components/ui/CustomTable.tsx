import React from 'react';
import Table, { TableProps, TablePaginationConfig } from 'antd/lib/table';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Typography from 'antd/lib/typography';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import Space from 'antd/lib/space';

const { Title } = Typography;
const { Search } = Input;

export interface CustomTableProps<RecordType extends object = any> {
  columns: TableProps<RecordType>['columns'];
  dataSource: RecordType[];
  loading: boolean;
  totalRecords?: number;
  paginationConfig?: TablePaginationConfig | false;
  rowKey?: string | ((record: RecordType) => string);
  headerTitle?: string;
  showAddButton?: boolean;
  onAddButtonClick?: () => void;
  addButtonLabel?: string;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  headerExtraContent?: React.ReactNode;
  tableProps?: Omit<TableProps<RecordType>, 'columns' | 'dataSource' | 'loading' | 'pagination' | 'rowKey'>;
  containerClassName?: string;
  headerClassName?: string;
}

const CustomTable = <RecordType extends object = any>({
  columns,
  dataSource,
  loading,
  totalRecords,
  paginationConfig: customPaginationConfig,
  rowKey = 'id',
  headerTitle,
  showAddButton = false,
  onAddButtonClick,
  addButtonLabel = 'Añadir Nuevo',
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Buscar...',
  headerExtraContent,
  tableProps,
  containerClassName = 'mb-6',
  headerClassName = 'mb-4',
}: CustomTableProps<RecordType>) => {

  const defaultPaginationConfig: TablePaginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
  };

  let resolvedPagination: TablePaginationConfig | false;
  if (customPaginationConfig === false) {
    resolvedPagination = false;
  } else {
    resolvedPagination = { ...defaultPaginationConfig }; 
    if (typeof customPaginationConfig === 'object') {
      resolvedPagination = { ...resolvedPagination, ...customPaginationConfig };
    }
    if (totalRecords !== undefined) {
      resolvedPagination.total = totalRecords;
    }
  }

  return (
    <div className={`custom-table-container ${containerClassName}`}>
      {(headerTitle || showSearch || showAddButton || headerExtraContent) && (
        <div className={`custom-table-header ${headerClassName}`}>
          {/* Primera fila: Título y Botón de Añadir */}
          {(headerTitle || showAddButton) && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              {headerTitle && <Title level={3} style={{ margin: 0, color: 'white' }} className="whitespace-nowrap">{headerTitle}</Title>}
              {showAddButton && onAddButtonClick && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onAddButtonClick}
                  size="large" // Coincidir con el tamaño del botón en la captura de Sucursales
                >
                  {addButtonLabel}
                </Button>
              )}
            </div>
          )}

          {/* Segunda fila: Búsqueda y Contenido Extra */}
          {(showSearch || headerExtraContent) && (
            <div className="flex flex-wrap items-center justify-start gap-4">
              {showSearch && onSearch && (
                <Search
                  placeholder={searchPlaceholder}
                  onSearch={onSearch}
                  allowClear
                  style={{ width: 300 }} // Ancho fijo o adaptable según preferencia
                  enterButton
                />
              )}
              {headerExtraContent}
            </div>
          )}
        </div>
      )}

      <Table<RecordType>
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={resolvedPagination}
        scroll={{ x: 'max-content' }}
        {...tableProps}
      />
    </div>
  );
};

export default CustomTable;
