"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import CustomTable from "@/components/ui/CustomTable";

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
import Popconfirm from "antd/lib/popconfirm";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
import type { TableProps } from "antd/lib/table";

// Importación selectiva de iconos
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";

// Servicios y tipos
import { getMarcasPaginadas, createMarca, updateMarca, deleteMarca } from "@/lib/api/marcaService";
import type { Marca } from "@/types";

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
        response = await updateMarca(editingBrand.id, values);
      } else {
        response = await createMarca(values);
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
      const response = await deleteMarca(id);
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
    // Columna de sitio web eliminada ya que no es parte del modelo
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
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
      <CustomTable<Marca>
        columns={columns}
        dataSource={brands}
        loading={loading}
        rowKey="id"
        headerTitle="Gestión de Marcas"
        showAddButton={true}
        onAddButtonClick={() => showModal()}
        addButtonLabel="Nueva Marca"
        showSearch={true}
        onSearch={setSearchText}
        searchPlaceholder="Buscar marca..."
        paginationConfig={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            if (newPageSize) setPageSize(newPageSize);
          },
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} marcas`,
        }}
        tableProps={{
        }}
      />

      {modalVisible && (
        <Modal
          title={editingBrand ? "Editar Marca" : "Nueva Marca"}
          open={modalVisible}
          onCancel={handleCancel}
          footer={modalFooter}
          width={600} 
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
          </Form>
        </Modal>
      )}
    </div>
  );
}
