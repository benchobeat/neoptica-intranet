// Importar los tipos de los iconos de Ant Design
import { IconDefinition } from '@ant-design/icons';

// Declarar los módulos para los iconos
declare module '@ant-design/icons' {
  // Tipos básicos
  export type IconType = 'plus' | 'edit' | 'delete' | 'search' | 'filter' | 'user' | 'phone' | 'mail' | 'home' | 'idcard' | 'lock' | 'info-circle' | 'exclamation-circle' | 'upload' | 'more';
  
  // Interfaz para los componentes de iconos
  export interface AntdIconProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<HTMLElement>;
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
  }

  // Tipo para los componentes de iconos
  export type AntdIconComponent = React.ForwardRefExoticComponent<AntdIconProps>;

  // Declarar los iconos que estamos usando
  export const PlusOutlined: AntdIconComponent;
  export const EditOutlined: AntdIconComponent;
  export const DeleteOutlined: AntdIconComponent;
  export const SearchOutlined: AntdIconComponent;
  export const FilterOutlined: AntdIconComponent;
  export const UserOutlined: AntdIconComponent;
  export const PhoneOutlined: AntdIconComponent;
  export const MailOutlined: AntdIconComponent;
  export const HomeOutlined: AntdIconComponent;
  export const IdcardOutlined: AntdIconComponent;
  export const LockOutlined: AntdIconComponent;
  export const InfoCircleOutlined: AntdIconComponent;
  export const ExclamationCircleOutlined: AntdIconComponent;
  export const UploadOutlined: AntdIconComponent;
  export const MoreOutlined: AntdIconComponent;

  // Tipos adicionales necesarios
  export interface CustomIconOptions {
    scriptUrl?: string;
    extraCommonProps?: Record<string, any>;
  }

  export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
    spin?: boolean;
    rotate?: number;
    type?: string;
    className?: string;
    title?: string;
    onClick?: React.MouseEventHandler<any>;
    component?: React.ComponentType<CustomIconComponentProps>;
    viewBox?: string;
  }

  export interface CustomIconComponentProps {
    width: string | number;
    height: string | number;
    fill: string;
    viewBox?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface IconComponentProps extends IconBaseProps {
    type: IconType | string;
    component?: React.ComponentType<CustomIconComponentProps>;
    twoToneColor?: string;
    viewBox?: string;
  }

  export const createFromIconfontCN: (options: CustomIconOptions) => React.FC<IconComponentProps>;
  export const getTwoToneColor: () => string;
  export const setTwoToneColor: (color: string) => void;
}

// Extender las propiedades de los componentes de Ant Design
declare module 'antd' {
  interface TableProps<RecordType> {
    // Añadir propiedades personalizadas aquí si es necesario
  }
}

// Declaraciones para módulos CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}
