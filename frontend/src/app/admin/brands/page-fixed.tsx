"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import "../shared/dark-table.css";

// Importaciones selectivas de Ant Design para reducir el tamaño del bundle
import Table from "antd/lib/table";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
// Modal importado dinámicamente para reducir el bundle inicial
const Modal = dynamic(() => import("antd/lib/modal"), {
  ssr: false,
  loading: () => <div className="bg-gray-800 p-6 rounded-lg animate-pulse">Cargando...</div>
});
import Form from "antd/lib/form";
import message from "antd/lib/message";
import Popconfirm from "antd/lib/popconfirm";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
import type { TableProps } from "antd/lib/table";

// Importación selectiva de iconos
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";

// Servicios y tipos
import { getMarcasPaginadas, crearMarca, actualizarMarca, eliminarMarca } from "@/services/marcasService";
import type { Marca } from "@/interfaces/types";

// Componente principal de la página de marcas optimizado para reducir renders
export default function BrandsPage() {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Marca[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Marca | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Cargar marcas al montar el componente o cambiar la paginación o búsqueda
  // 1. Memoiza la función, usando useCallback y pasando como dependencias los estados que usa
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMarcasPaginadas(page, pageSize, searchText);
      if (response.ok && response.data) {
        setBrands(response.data.items);
        setTotal(response.data.total);
      } else {
        message.error(response.error || "Error al cargar las marcas");
      }
    } catch (error) {
      console.error("Error al cargar marcas:", error);
      message.error("Error al cargar las marcas");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);

  // 2. El useEffect solo depende de fetchBrands (la función memoizada)
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);
  
  // La búsqueda ahora se maneja automáticamente a través del useEffect cuando cambia searchText

  // Memoiza la función showModal para evitar recrearla en cada render
  const showModal = useCallback((brand?: Marca) => {
    setEditingBrand(brand || null);
    form.resetFields();
    if (brand) {
      form.setFieldsValue({
        nombre: brand.nombre,
        descripcion: brand.descripcion || "",
        website: brand.website || "",
      });
    }
    setModalVisible(true);
  }, [form]);

  // Memoiza handleCancel para evitar recreaciones innecesarias
  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Memoiza handleSubmit para mejorar rendimiento
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Ya no manejamos logos en esta versión

      let response;
      if (editingBrand) {
        response = await actualizarMarca(editingBrand.id, values);
      } else {
        response = await crearMarca(values);
      }

      if (response.ok) {
        message.success(
          editingBrand
            ? "Marca actualizada correctamente"
            : "Marca creada correctamente"
        );
        setModalVisible(false);
        fetchBrands();
      } else {
        message.error(response.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      message.error("Por favor verifica los campos del formulario");
    } finally {
      setLoading(false);
    }
  }, [editingBrand, form, fetchBrands]);

  // Memoiza handleDelete para evitar recreaciones innecesarias
  const handleDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await eliminarMarca(id);
      if (response.ok) {
        message.success("Marca eliminada correctamente");
        fetchBrands();
      } else {
        message.error(response.error || "Error al eliminar la marca");
      }
    } catch (error) {
      console.error("Error al eliminar marca:", error);
      message.error("Error al eliminar la marca");
    } finally {
      setLoading(false);
    }
  }, [fetchBrands]);

  // Memoiza las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre", 
      width: "30%",
      sorter: (a: Marca, b: Marca) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      render: (descripcion: string | null) => descripcion || "N/A",
    },
    {
      title: "Sitio Web",
      dataIndex: "website",
      key: "website",
      render: (website: string | null) =>
        website ? (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <LinkOutlined /> {website}
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: "15%",
      render: (text: any, record: Marca) => (
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
            title="¿Estás seguro de eliminar esta marca?"
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
  ], [handleDelete, showModal]);

  // Footer del modal memoizado para evitar re-renders
  const modalFooter = useMemo(() => [
    <Button key="cancel" onClick={handleCancel}>
      Cancelar
    </Button>,
    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
      {editingBrand ? "Actualizar" : "Crear"}
    </Button>,
  ], [handleCancel, handleSubmit, editingBrand, loading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestión de Marcas</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Marca
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Buscar marca"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </div>

      <div className="relative">
        <Table
          className="custom-table"
          columns={columns}
          dataSource={brands}
          rowKey="id"
          loading={loading}
          pagination={useMemo(() => ({
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (page: number, pageSize: number | undefined) => {
              setPage(page);
              if (pageSize) setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} de ${total} marcas`,
          }), [page, pageSize, total])}
        />
      </div>

      {/* Solo renderizamos el Modal cuando modalVisible es true */}
      {modalVisible && (
        <Modal
          title={editingBrand ? "Editar Marca" : "Nueva Marca"}
          open={modalVisible}
          onCancel={handleCancel}
          footer={modalFooter}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: "Por favor ingresa el nombre de la marca" },
                { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
              ]}
            >
              <Input placeholder="Ej: Ray-Ban" />
            </Form.Item>
            
            <Form.Item
              name="descripcion"
              label="Descripción"
            >
              <Input.TextArea 
                placeholder="Descripción de la marca" 
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>
            
            <Form.Item
              name="website"
              label="Sitio Web"
              rules={[
                { 
                  pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 
                  message: "Por favor ingresa una URL válida" 
                },
              ]}
            >
              <Input placeholder="https://ejemplo.com" />
            </Form.Item>
            
            {/* Campo de logo eliminado para la versión actual */}
          </Form>
        </Modal>
      )}

      {/* Estilos personalizados para tablas en modo oscuro */}
      <style jsx global>{`
        .custom-table .ant-table {
          background-color: transparent;
          color: white;
        }
        .custom-table .ant-table-thead > tr > th {
          background-color: rgba(31, 41, 55, 0.7);
          color: white;
          border-bottom: 1px solid #374151;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151;
          color: #e5e7eb;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(55, 65, 81, 0.3);
        }
        .custom-table .ant-empty-description {
          color: #9ca3af;
        }
        .custom-table .ant-table-pagination .ant-pagination-item-link,
        .custom-table .ant-pagination-item a {
          color: #e5e7eb;
        }
        .custom-table .ant-pagination-item-active {
          background-color: #3730a3;
          border-color: #3730a3;
        }
        .custom-table .ant-pagination-item-active a {
          color: white;
        }
        .custom-table .ant-pagination-item:hover {
          border-color: #6366f1;
        }
        .custom-table .ant-pagination-item:hover a {
          color: #6366f1;
        }
        .custom-table .ant-table-column-sorter {
          color: #9ca3af;
        }
        .custom-table .ant-table-column-sort {
          background-color: rgba(31, 41, 55, 0.7);
        }
      `}</style>
    </div>
  );
}
