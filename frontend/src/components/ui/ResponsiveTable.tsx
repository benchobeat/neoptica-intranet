'use client';

import { Table, TableProps, Card, Button, Space, Dropdown, Tag, Tooltip, Input } from 'antd';
import { MoreOutlined, SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useState, useMemo, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const { Search } = Input;

interface ResponsiveTableProps<RecordType> extends TableProps<RecordType> {
  headerTitle?: string | ReactNode;
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  showAddButton?: boolean;
  onAddButtonClick?: () => void;
  searchPlaceholder?: string;
  rowKey?: string;
  loading?: boolean;
  mobileCardRender?: (record: RecordType) => ReactNode;
  className?: string;
  filters?: any[];
}

// Estilos base para la tabla en móviles
const mobileCardBaseStyle: React.CSSProperties = {
  marginBottom: '12px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  border: '1px solid #2d3748',
  backgroundColor: '#1a202c',
  transition: 'all 0.2s ease',
};

// Estilos para el hover de las tarjetas móviles
const mobileCardHoverStyle: React.CSSProperties = {
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

// Estilos para el contenedor de búsqueda
const searchContainerStyle: React.CSSProperties = {
  marginBottom: '16px',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

// Estilos para el encabezado de la tabla
const tableHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  flexWrap: 'wrap',
  gap: '8px',
};

// Estilos para el contenedor de la tabla
const tableContainerStyle: React.CSSProperties = {
  width: '100%',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: '0 16px',
};

// Estilos para el contenedor de la tabla en móviles
const mobileTableContainerStyle: React.CSSProperties = {
  padding: '0 8px',
};

// Estilos para la barra de desplazamiento personalizada
const scrollbarStyles = `
  .responsive-table-scrollbar::-webkit-scrollbar {
    height: 8px;
  }
  .responsive-table-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 4px;
  }
  .responsive-table-scrollbar::-webkit-scrollbar-track {
    background-color: #2d3748;
    border-radius: 4px;
  }
`;

// Estilos para la tarjeta de móvil
const mobileCardContentStyle: React.CSSProperties = {
  padding: '12px',
};

// Estilos para las acciones en móvil
const mobileActionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '8px',
  gap: '8px',
};

// Estilos para el contenedor de filtros
const filterContainerStyle: React.CSSProperties = {
  marginBottom: '16px',
};

// Estilos para el contenedor de paginación
const paginationContainerStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  justifyContent: 'flex-end',
};

export function ResponsiveTable<RecordType extends object>({
  columns = [],
  dataSource = [],
  headerTitle,
  showSearch = true,
  onSearch,
  showAddButton = true,
  onAddButtonClick,
  searchPlaceholder = 'Buscar...',
  rowKey = 'id',
  loading = false,
  mobileCardRender,
  className,
  filters,
  ...rest
}: ResponsiveTableProps<RecordType>) {
  // Ajustar breakpoint para móviles y tablets pequeñas
  const isMobile = useMediaQuery({ maxWidth: 991 });
  const isSmallMobile = useMediaQuery({ maxWidth: 640 });
  
  // Inyectar estilos personalizados
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      ${scrollbarStyles}
      
      /* Definición de variables de color personalizadas */
      :root {
        --primary-blue: #1e214d; /* Azul oscuro principal #1e214d */
        --primary-blue-hover: #2f3466;
        --primary-blue-active: #141735;
        --primary-blue-light: #3a3f7a;
        --primary-blue-lighter: #4f56a3;
      }
      
      /* Estilos para los botones primarios (azul del menú) */
      .ant-btn-primary {
        background-color: var(--primary-blue);
        border-color: var(--primary-blue);
      }
      .ant-btn-primary:hover, .ant-btn-primary:focus {
        background-color: var(--primary-blue-hover);
        border-color: var(--primary-blue-hover);
      }
      .ant-btn-primary:active {
        background-color: var(--primary-blue-active);
        border-color: var(--primary-blue-active);
      }
      
      /* Estilos para el botón de búsqueda */
      .ant-input-search .ant-input-group .ant-input-affix-wrapper:not(:last-child) {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }
      .ant-input-search .ant-input-group .ant-input-search-button {
        background-color: #1e214d;
        border-color: #1e214d;
      }
      .ant-input-search .ant-input-group .ant-input-search-button:hover {
        background-color: #2f3466;
        border-color: #2f3466;
      }
      
      /* Estilos para la paginación */
      .ant-pagination .ant-pagination-item {
        border-color: #434190;
        background: transparent;
      }
      .ant-pagination .ant-pagination-item a {
        color: #a0aec0;
      }
      .ant-pagination .ant-pagination-item-active {
        border-color: #1e214d !important;
        background: #1e214d !important;
      }
      .ant-pagination .ant-pagination-item-active a {
        color: white !important;
      }
      .ant-pagination .ant-pagination-item-active:hover {
        border-color: #1e214d !important;
        background: #1e214d !important;
      }
      .ant-pagination .ant-pagination-item-active:hover a {
        color: white !important;
      }
      .ant-pagination .ant-pagination-item:hover {
        border-color: #434190 !important;
      }
      .ant-pagination .ant-pagination-item:hover a {
        color: #a0aec0 !important;
      }
      
      /* Estilos para selector de páginas por página */
      .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: rgba(30, 33, 77, 0.2); /* Color de fondo con transparencia */
        color: #a3a8e0; /* Texto más claro para mejor contraste */
      }
      .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
        border-color: #2f3466;
      }
      .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
        border-color: #1e214d;
        box-shadow: 0 0 0 2px rgba(30, 33, 77, 0.3);
      }
      .ant-pagination-options .ant-select-dropdown {
        border: 1px solid #333;
        background-color: #1a202c;
      }
      .ant-pagination-options-size-changer.ant-select {
        color: #fff;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Estilos para el contenedor de la tabla con diseño responsivo
  const tableContainerStyleWithResponsive = useMemo<React.CSSProperties>(() => ({
    ...tableContainerStyle,
    minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
    maxWidth: '100%',
    ...(isMobile && mobileTableContainerStyle),
    scrollbarWidth: 'thin',
    scrollbarColor: '#4a5568 #2d3748',
  }), [isMobile]);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();
  
  // Filtrar datos basados en la búsqueda
  const filteredData = useMemo(() => {
    if (!searchText || !onSearch) return dataSource;
    return dataSource.filter(item => 
      Object.values(item).some(
        value => 
          value && 
          value.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [dataSource, searchText, onSearch]);

  // Manejar cambio de búsqueda
  const handleSearch = (value: string) => {
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  // Renderizar la vista móvil
  const renderMobileView = () => {
    if (mobileCardRender) {
      return (
        <div className="space-y-3">
          {filteredData.map((record: RecordType, index: number) => (
            <div key={index} style={isSmallMobile ? { ...mobileCardBaseStyle, margin: '0 0 12px 0' } : { ...mobileCardBaseStyle, margin: '0 8px 12px' }} className="mobile-card-item">
              {mobileCardRender(record)}
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron datos
            </div>
          )}
        </div>
      );
    }

    // Vista móvil por defecto
    return (
      <div className="space-y-3 px-2">
        {filteredData.map((record: any, index: number) => (
          <Card 
            key={record[rowKey as keyof typeof record] || index}
            style={{
              ...mobileCardBaseStyle,
              ...(isSmallMobile ? { margin: '0 0 12px 0' } : { margin: '0 8px 12px' })
            }}
            className="hover:shadow-md transition-shadow"
            bodyStyle={{
              padding: '12px',
              backgroundColor: '#1a202c',
              borderRadius: '8px',
            }}
          >
            <div style={mobileCardContentStyle}>
              {columns.slice(0, 3).map((column: any) => {
                const dataIndex = column.dataIndex || column.key;
                const value = record[dataIndex];
                const title = column.title?.toString() || '';
                
                if (!value) return null;
                
                return (
                  <div key={dataIndex} className="mb-2">
                    <div className="text-xs text-gray-500 font-medium">{title}</div>
                    <div className="truncate">
                      {column.render ? column.render(value, record, index) : value}
                    </div>
                  </div>
                );
              })}
              
              {columns.length > 3 && (
                <div className="text-right mt-2">
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => {
                      // Navegar a la vista de detalles o mostrar un modal
                      if (record.id) {
                        router.push(`/admin/users/${record.id}`);
                      }
                    }}
                  >
                    Ver más
                  </Button>
                </div>
              )}
              
              {(onAddButtonClick || rest.rowSelection) && (
                <div style={mobileActionsStyle}>
                  {onAddButtonClick && (
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => onAddButtonClick()}
                    >
                      Editar
                    </Button>
                  )}
                  
                  {rest.rowSelection && rest.rowSelection.onChange && (
                    <Button 
                      type="default" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const selectedKeys = [record[rowKey as keyof typeof record]];
                        rest.rowSelection?.onChange?.(selectedKeys, [], {} as any);
                      }}
                    >
                      Seleccionar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron datos
          </div>
        )}
      </div>
    );
  };

  // Renderizar la vista de escritorio
  const renderDesktopView = () => (
    <div style={tableContainerStyle}>
      <Table
        {...rest}
        columns={columns}
        dataSource={filteredData as any[]}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          ...rest.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total: ${total}`,
          size: 'small',
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        className={cn('responsive-table', className)}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );

  // Renderizar el encabezado
  const renderHeader = () => (
    <div style={tableHeaderStyle}>
      {headerTitle && (
        <h2 className="text-lg font-semibold m-0">
          {headerTitle}
        </h2>
      )}
      
      <Space size="middle" wrap>
        {showSearch && (
          <Search
            placeholder={searchPlaceholder}
            allowClear
            enterButton={
              <div className="flex items-center justify-center">
                <SearchOutlined className="text-white" />
              </div>
            }
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            className="w-full sm:w-64 [&_.ant-input]:border-gray-600 [&_.ant-input]:bg-gray-700 [&_.ant-input]:text-white [&_.ant-input]:placeholder-gray-400 [&_.ant-input]:hover:border-blue-400 [&_.ant-input]:focus:border-blue-500 [&_.ant-input]:focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)]"
          />
        )}
        
        {showAddButton && onAddButtonClick && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAddButtonClick}
            className="flex items-center"
            style={{
              backgroundColor: '#1e214d', 
              borderColor: '#1e214d',
              transition: 'all 0.2s',
              boxShadow: '0 2px 0 rgba(20, 23, 53, 0.3)'
            }}
          >
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        )}
        
        {filters && filters.length > 0 && (
          <Dropdown
            menu={{
              items: filters,
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button icon={<FilterOutlined />}>
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          </Dropdown>
        )}
      </Space>
    </div>
  );

  return (
    <div className="w-full">
      {renderHeader()}
      <div className="mt-4">
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .ant-table {
            font-size: 13px;
          }
          .ant-table-thead > tr > th,
          .ant-table-tbody > tr > td {
            padding: 8px !important;
          }
          .ant-btn {
            font-size: 12px;
          }
        }
        
        .ant-table-tbody > tr > td {
          word-break: break-word;
        }
        
        .ant-table-thead > tr > th {
          white-space: nowrap;
        }
        
        .ant-table-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}

export default ResponsiveTable;
