"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { HexColorPicker } from "react-colorful";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

// Importaciones selectivas de Ant Design para reducir el tamaño del bundle
import Button from "antd/lib/button";
import Input from "antd/lib/input";
// Modal importado dinámicamente para reducir el bundle inicial
const Modal = dynamic(() => import("antd/lib/modal"), {
  ssr: false,
  loading: () => <div className="bg-gray-800 p-6 rounded-lg animate-pulse">Cargando...</div>
});
import Form from "antd/lib/form";
import message from "antd/lib/message";
import Tooltip from "antd/lib/tooltip";
import Popconfirm from "antd/lib/popconfirm";

// Importación selectiva de iconos
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";

// Servicios y tipos
import { createColor, deleteColor, getColoresPaginados, updateColor } from "@/lib/api/colorService";
import type { Color } from "@/types";

// Función utilitaria para generar colores consistentes basados en texto
function generarColorDesdeTexto(texto: string): string {
  // Generar un hash basado en el texto
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convertir a color hexadecimal
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}


export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  // Estado local para el color visual
  const [form] = Form.useForm();
  const [pickerColor, setPickerColor] = useState<string>("#000000");
  const [searchText, setSearchText] = useState("");
  const [formInitialized, setFormInitialized] = useState(false);

  // Cargar colores al montar el componente o cambiar la paginación
  const fetchColors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getColoresPaginados(page, pageSize, searchText);
      if (response.ok && response.data) {
        setColors(response.data.items);
        setTotal(response.data.total);
      } else {
        message.error(response.error || "Error al cargar los colores");
      }
    } catch (error) {
      console.error("Error al cargar colores:", error);
      message.error("Error al cargar los colores");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);

  // Efecto para cargar colores al montar o cambiar el estado de dependencias
  useEffect(() => {
    fetchColors();
  }, [fetchColors]);
  
  // Manejador para la búsqueda
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    // La búsqueda se dispara automáticamente a través del useEffect cuando cambia searchText
  }, []);

  // Mostrar modal para editar o crear
  const showModal = useCallback((color?: Color) => {
    // Establecer color negro por defecto si no hay color o si el código hex es nulo/indefinido
    const defaultColor = "#000000";
    let initialColor = defaultColor;
    
    if (color) {
      // Usar el color del registro o el valor por defecto si es nulo/indefinido
      initialColor = color.codigo_hex || defaultColor;
      // Actualizamos el estado primero
      setEditingColor({
        ...color,
        codigo_hex: initialColor
      });
    } else {
      setEditingColor(null);
    }
    
    setPickerColor(initialColor);
    setModalVisible(true);
    setFormInitialized(true);
  }, []);

  // Manejar cierre del modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingColor(null);
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      // Asegurarse que el código hex se guarda con el valor del picker
      values.codigo_hex = pickerColor;
      
      setLoading(true);
      let response;
      
      if (editingColor) {
        response = await updateColor(editingColor.id, values);
      } else {
        response = await createColor(values);
      }

      if (response.ok) {
        message.success(
          editingColor
            ? "Color actualizado correctamente"
            : "Color creado correctamente"
        );
        setModalVisible(false);
        fetchColors();
      } else {
        message.error(response.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      message.error("Por favor verifica los campos del formulario");
    } finally {
      setLoading(false);
    }
  }, [editingColor, form, pickerColor, fetchColors]);

  // Manejar eliminación
  const handleDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await deleteColor(id);
      if (response.ok) {
        message.success("Color eliminado correctamente");
        fetchColors();
      } else {
        message.error(response.error || "Error al eliminar el color");
      }
    } catch (error) {
      console.error("Error al eliminar color:", error);
      message.error("Error al eliminar el color");
    } finally {
      setLoading(false);
    }
  }, [fetchColors]);

  // Actualizar manualmente el color y el campo de formulario
  const handleColorChange = useCallback((newColor: string) => {
    setPickerColor(newColor);
    form.setFieldsValue({ codigo_hex: newColor });
  }, [form]);

  // Memoiza las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => [
    {
      title: "Color",
      dataIndex: "codigo_hex",
      key: "codigo_hex",
      width: 60,
      align: 'center' as const,
      render: (hex: string) => (
        <Tooltip title={hex}>
          <div 
            className="rounded-md w-6 h-6 border border-gray-300 mx-auto" 
            style={{ backgroundColor: hex }}
          />
        </Tooltip>
      )
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Color, b: Color) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      responsive: ['md' as const],
      render: (descripcion: string | null) => descripcion || "N/A",
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 120,
      render: (text: any, record: Color) => (
        <div className="flex gap-2">
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              ghost
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Estás seguro de eliminar este color?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Tooltip title="Eliminar">
              <Button icon={<DeleteOutlined />} type="primary" size="small" danger ghost />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ], [showModal, handleDelete]);

  // Renderizado personalizado para móviles
  const mobileCardRender = useCallback((item: Color) => {
    return (
      <div className="mobile-card bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div 
              className="rounded-md w-8 h-8 border border-gray-300 mr-3"
              style={{ backgroundColor: item.codigo_hex || '#000000' }}
            />
            <div>
              <div className="font-medium text-white">{item.nombre}</div>
              <div className="text-sm text-gray-400">{item.codigo_hex}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Tooltip title="Editar">
              <Button
                icon={<EditOutlined />}
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  showModal(item);
                }}
                className="text-blue-400 hover:bg-blue-900/30"
              />
            </Tooltip>
            <Popconfirm
              title="¿Estás seguro de eliminar este color?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(item.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Sí"
              cancelText="No"
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            >
              <Button 
                icon={<DeleteOutlined />}
                type="text"
                size="small"
                danger
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-red-900/30"
              />
            </Popconfirm>
          </div>
        </div>
        {item.descripcion && (
          <div className="text-sm text-gray-300 mt-2">
            {item.descripcion}
          </div>
        )}
      </div>
    );
  }, [showModal, handleDelete]);
  
  // Footer del modal memoizado para evitar re-renders
  const modalFooter = useMemo(() => [
    <Button key="cancel" onClick={handleCancel}>
      Cancelar
    </Button>,
    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
      {editingColor ? "Actualizar" : "Crear"}
    </Button>,
  ], [handleCancel, handleSubmit, editingColor, loading]);

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <div className="responsive-table-container">
        <ResponsiveTable<Color>
          columns={columns}
          dataSource={colors}
          loading={loading}
          rowKey="id"
          headerTitle="Gestión de Colores"
          showAddButton={true}
          onAddButtonClick={() => showModal()}
          showSearch={true}
          onSearch={setSearchText}
          searchPlaceholder="Buscar color..."
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} colores`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          className="responsive-table"
          mobileCardRender={mobileCardRender}
        />
      </div>

      <Modal
        key={editingColor ? `edit-${editingColor.id}` : 'create'}
        title={editingColor ? "Editar Color" : "Nuevo Color"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={modalFooter}
        width={600} // Consistent modal width
        afterClose={() => setFormInitialized(false)}
      >
        {formInitialized && (
          <Form 
            form={form} 
            layout="vertical"
            initialValues={editingColor ? {
              nombre: editingColor.nombre,
              codigo_hex: pickerColor,
              descripcion: (editingColor as any).descripcion || undefined,
            } : {
              codigo_hex: pickerColor
            }}
          >
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: "Por favor ingresa el nombre del color" },
                { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
              ]}
            >
              <Input placeholder="Ej: Rojo Intenso" />
            </Form.Item>
            
            <Form.Item
              name="codigo_hex"
              label="Código Hexadecimal"
              rules={[{ required: true, message: "Por favor selecciona un color" }]}
            >
              <Input 
                prefix={<div className="w-4 h-4 mr-2 border border-gray-400 rounded" style={{ backgroundColor: pickerColor }}></div>}
                value={pickerColor} // This will be updated by handleColorChange via form.setFieldsValue
                placeholder="#FFFFFF"
                readOnly // User interacts with HexColorPicker, not this input directly
              />
            </Form.Item>
            
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-gray-300">Selecciona un color:</div>
              <div className="flex justify-center items-center p-2 bg-gray-700 rounded-md">
                <HexColorPicker color={pickerColor} onChange={handleColorChange} />
              </div>
            </div>
            
            <Form.Item
              name="descripcion"
              label="Descripción"
            >
              <Input.TextArea 
                placeholder="Descripción del color (opcional)" 
                rows={2}
                maxLength={200}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
