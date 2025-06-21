module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      // Configuración específica para archivos TypeScript
      files: ['*.ts'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      // Excluir scripts de TypeScript por no estar en tsconfig.json
      files: ['scripts/*.ts'],
      extends: ['eslint:recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: null, // Desactivar la validación basada en proyecto
      },
    },
    {
      // Desactivar el análisis basado en proyecto para archivos de configuración JS
      files: ['*.js'],
      extends: ['eslint:recommended'],
      parser: 'espree', // Usar parser estándar de ESLint para archivos JS
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    {
      files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // Configuración principal: resolver de TypeScript con paths
      typescript: {
        alwaysTryTypes: true, 
        project: './tsconfig.json',
      },
      // Configuración explícita para aliases
      alias: {
        extensions: ['.js', '.ts', '.json'],
        map: [
          ['@', './src'],
          ['@tests', './tests']
        ]
      },
      // Configuración de respaldo adicional
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['src'],
      },
    },
  },
  rules: {
    // Reglas base de ESLint
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off', // Desactivamos para usar la versión de TypeScript
    'no-useless-escape': 'off', // Desactivar para evitar conflictos con expresiones regulares
    'require-await': 'warn',
    'no-return-await': 'warn',
    'object-shorthand': ['warn', 'always'],
    'prefer-const': 'warn',

    // Reglas de TypeScript
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // Reglas de importación
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // Temporalmente desactivada hasta resolver problemas con el resolver de alias
    'import/no-unresolved': 'off',
    'import/named': 'warn',
    'import/default': 'warn',
    'import/namespace': 'warn',
    'import/no-cycle': 'warn',
    'import/no-self-import': 'warn',
    'import/no-useless-path-segments': 'warn',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',

    // Reglas de Prettier (manejará el formateo)
    'prettier/prettier': 'warn',
  },

};
