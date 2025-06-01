import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
import React from 'react';
import { DynamicOptions, LoadableComponent, DynamicOptionsLoadingProps } from 'next/dynamic';

/**
 * Función para importar componentes de forma dinámica con un fallback personalizado
 * Mejora el rendimiento inicial y reduce el tamaño del bundle
 * 
 * @param importFunc - Función de importación dinámica
 * @param options - Opciones adicionales como ssr y loader personalizado
 * @returns Componente cargado dinámicamente
 */
export function dynamicComponent<P = {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    ssr?: boolean;
    loading?: (props: DynamicOptionsLoadingProps) => JSX.Element | null;
  } = {}
): LoadableComponent<P> {
  return dynamic(importFunc, {
    loading: options.loading || (() => <Skeleton active />),
    ssr: options.ssr !== undefined ? options.ssr : false,
  });
}
