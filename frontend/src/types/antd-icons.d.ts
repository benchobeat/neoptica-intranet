import { IconDefinition } from '@ant-design/icons';

declare module '@ant-design/icons' {
  // Extender los tipos de iconos si es necesario
  export * from '@ant-design/icons/lib/types';
  
  // Asegurarse de que los iconos estén correctamente tipados
  export const PlusOutlined: IconDefinition;
  export const EditOutlined: IconDefinition;
  export const DeleteOutlined: IconDefinition;
  export const ExclamationCircleOutlined: IconDefinition;
  export const UploadOutlined: IconDefinition;
  export const UserOutlined: IconDefinition;
  export const PhoneOutlined: IconDefinition;
  export const MailOutlined: IconDefinition;
  export const HomeOutlined: IconDefinition;
  export const IdcardOutlined: IconDefinition;
  export const LockOutlined: IconDefinition;
  export const InfoCircleOutlined: IconDefinition;
  export const MoreOutlined: IconDefinition;
  export const SearchOutlined: IconDefinition;
  export const FilterOutlined: IconDefinition;
}
