"use client";

import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Tag, Tooltip } from "antd";
import type { TableColumnType } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { getColoresPaginados, createColor, updateColor, deleteColor } from "@/lib/api/colorService";
import { Color } from "@/types";

/**
 * Genera un color hexadecimal basado en un texto
 * Esto garantiza que el mismo texto siempre genere el mismo color
 */
function generarColorDesdeTexto(texto: string): string {
  // Función hash simple para convertir texto en un número
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

import "./colors-dark-table.css";

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [form] = Form.useForm();
  // Estado local para el color visual
  const [pickerColor, setPickerColor] = useState<string>("#000000");
  const [searchText, setSearchText] = useState("");

  // Cargar colores al montar el componente o cambiar la paginación
  const fetchColors = async (currentPage = page, currentPageSize = pageSize, currentSearchText = searchText) => {
    setLoading(true);
    console.log("Iniciando carga de colores, página:", currentPage, "tamaño:", currentPageSize, "buscar:", currentSearchText);
    try {
      const response = await getColoresPaginados(currentPage, currentPageSize, currentSearchText);
      console.log("Respuesta de la API (completa):", response);

      let fetchedColors: Color[] = [];
      let total = 0;

      if (response && response.ok && response.data) {
        if (Array.isArray(response.data)) {
          fetchedColors = response.data;
          total = response.data.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          fetchedColors = response.data.items;
          total = response.data.total || fetchedColors.length;
        }
      } else {
        console.error('Error en respuesta:', response);
        message.error(response?.error || "Error al cargar los colores. Revisa la consola para más detalles.");
      }

      // Inspeccionar detalladamente cada color para diagnosticar el problema
      console.log("Colores cargados (detalle):", fetchedColors.map(color => {
        // Inspeccionamos los datos exactamente como llegan de la API
        console.log(`Color ID: ${color.id} - Nombre: ${color.nombre}`);
        console.log(`codigo_hex: "${color.codigo_hex}"`);
        console.log(`Tipo: ${typeof color.codigo_hex}`);
        console.log(`Longitud: ${color.codigo_hex ? color.codigo_hex.length : 0}`);
        console.log(`Tiene hash: ${color.codigo_hex ? color.codigo_hex.startsWith('#') : false}`);
        
        // Los datos completos del color para referencia
        return {
          id: color.id,
          nombre: color.nombre,
          codigo_hex: color.codigo_hex,
          tipo: typeof color.codigo_hex,
          longitud: color.codigo_hex ? color.codigo_hex.length : 0,
          tiene_hash: color.codigo_hex ? color.codigo_hex.startsWith('#') : false,
          codigo_completo: color.codigo_hex,
        };
      }));
      
      setColors(fetchedColors);
      setTotal(total);
    } catch (error) {
      console.error("Error al cargar colores:", error);
      message.error("Error al cargar los colores. Revisa la consola del navegador para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar colores cuando cambia la página, tamaño o término de búsqueda
  useEffect(() => {
    // Usar los valores actuales del estado
    fetchColors(page, pageSize, searchText);
  }, [page, pageSize, searchText]);
  
  // No necesitamos handleSearch ya que useEffect se encarga de esto

  const showModal = (color?: Color) => {
    setEditingColor(color || null);
    form.resetFields();
    if (color) {
      form.setFieldsValue({
        nombre: color.nombre,
        codigo_hex: color.codigo_hex,
      });
      setPickerColor(color.codigo_hex || "#000000");
    } else {
      setPickerColor("#000000");
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Asegurarnos que el código hexadecimal siempre tenga # al inicio
      if (values.codigo_hex && typeof values.codigo_hex === 'string') {
        if (!values.codigo_hex.startsWith('#')) {
          values.codigo_hex = `#${values.codigo_hex}`;
        }
      }
      
      console.log('Datos a enviar al servidor:', values);
      console.log(`Color seleccionado: ${values.codigo_hex}, Tipo: ${typeof values.codigo_hex}`);

      let response;
      if (editingColor) {
        console.log(`Actualizando color ID: ${editingColor.id}`);
        response = await updateColor(editingColor.id, values);
      } else {
        console.log('Creando nuevo color');
        response = await createColor(values);
      }
      
      console.log('Respuesta del servidor:', response);

      if (response.ok) {
        message.success(
          editingColor
            ? "Color actualizado correctamente"
            : "Color creado correctamente"
        );
        setModalVisible(false);
        
        // Recargar los datos después de crear/actualizar
        await fetchColors();
      } else {
        message.error(response?.error || "Error al guardar el color");
      }
    } catch (error) {
      console.error("Error al guardar color:", error);
      message.error("Error al guardar el color");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  const columns = [
    {
      title: "Color",
      dataIndex: "codigo_hex",
      key: "color",
      render: (_: any, record: Color) => {
        // Usar un valor por defecto en caso de que codigo_hex sea undefined
        // Esto garantiza que siempre haya un color visible
        const defaultColor = record.nombre ? generarColorDesdeTexto(record.nombre) : "#000000"; 
        const hex = record.codigo_hex
          ? (record.codigo_hex.startsWith("#") ? record.codigo_hex : `#${record.codigo_hex}`)
          : defaultColor;
        
        // Si el valor es undefined o inválido, mostramos un indicador visual
        const esColorFaltante = !record.codigo_hex;
        
        return (
          <Tooltip title={esColorFaltante ? "Color no definido" : hex}>
            <div
              className="w-6 h-6 rounded-full border border-gray-300"
              style={{
                backgroundColor: hex,
                border: esColorFaltante ? "2px dashed #f00" : "1px solid rgba(0,0,0,0.2)"
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Color, b: Color) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo: boolean) =>
        activo ? (
          <Tag color="green">Activo</Tag>
        ) : (
          <Tag color="red">Inactivo</Tag>
        ),
      filters: [
        { text: "Activo", value: true },
        { text: "Inactivo", value: false },
      ],
      onFilter: (value: any, record: Color) => record.activo === value,
    },
    {
      title: "Creado",
      dataIndex: "creado_en",
      key: "creado_en",
      render: (date: string) => new Date(date).toLocaleString(),
      responsive: ["lg" as any],
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Color) => (
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
            <Button icon={<DeleteOutlined />} type="primary" size="small" danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestión de Colores</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nuevo Color
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Buscar color o nombre"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
            setPage(1); // Reiniciar paginación al buscar
          }}
          allowClear
          style={{ 
            width: 250, 
            background: '#23263a', 
            color: '#fff', 
            border: '1px solid #444',
            fontWeight: 500
          }}
          // Ya no necesitamos onPressEnter porque el useEffect responde a los cambios en searchText
        />
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <Table
          columns={columns}
          dataSource={colors}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (page, pageSize) => {
              setPage(page);
              if (pageSize) setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} colores`,
          }}
          className="rounded-lg overflow-hidden shadow-md custom-dark-table custom-table"
          style={{ background: "#181c2a" }}
        />
      </div>

      <Modal
        title={editingColor ? "Editar Color" : "Nuevo Color"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {editingColor ? "Actualizar" : "Crear"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: "Por favor ingresa el nombre del color" },
              { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
            ]}
          >
            <Input placeholder="Ej: Azul Marino" />
          </Form.Item>
          <Form.Item 
            name="codigo_hex" 
            label="Color"
            rules={[
              { required: true, message: "Por favor selecciona un color" },
              {
                pattern: /^#[0-9A-Fa-f]{6}$/,
                message: "Formato de color hexadecimal inválido (ej: #FF5733)",
              },
            ]}
          >
            <div>
              <HexColorPicker
                color={pickerColor}
                onChange={(color) => {
                  setPickerColor(color);
                  form.setFieldsValue({ codigo_hex: color });
                }}
                style={{ width: "100%" }}
              />
              <div className="flex items-center mt-4 gap-3">
                <div 
                  className="w-10 h-10 rounded-full border border-gray-300" 
                  style={{ backgroundColor: pickerColor }}
                />
                <div className="text-lg font-medium">{pickerColor}</div>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table {
          background-color: transparent;
          color: white;
        }
        .custom-table .ant-table-thead > tr > th {
          background-color: rgba(31, 41, 55, 0.7);
          color: white;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5);
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(55, 65, 81, 0.5);
        }
        .custom-table .ant-pagination {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-pagination-item a {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-pagination-item-active {
          background-color: rgba(79, 70, 229, 0.8);
        }
        .custom-table .ant-pagination-item-active a {
          color: white;
        }
        .custom-table .ant-pagination-item-link {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-empty-description {
          color: rgba(229, 231, 235, 0.9);
        }
      `}</style>
    </div>
  );
}
