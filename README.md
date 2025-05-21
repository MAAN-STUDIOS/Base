# base
# Proyecto MAAN-STUDIOS

## Requisitos

Antes de correr el proyecto, asegúrate de tener instaladas las siguientes extensiones en tu editor (recomendado: VS Code):

- **Prettier - Code formatter**
- **es6-string-html**
- **JavaScript (ES6) code snippets**

## Instalación

1. Clona este repositorio si aún no lo has hecho:
   ```bash
   git clone git@github.com:MAAN-STUDIOS/GDD.git
   cd tu-repositorio


2. Instala las dependencias (asegurate de estar en cd front-end):
`cd front-end`
`npm install`


3. Corre el proyecto:
`npm run dev`


# Base Repo

## Note:

To contribute craete a branch from "dev" branch and name it as the feature you are implementing, then make a pull request to dev and wait for scrum master to aprove it. 

# Contribuciones (Flujo de trabajo desde "dev")

## Para contribuir al proyecto, sigue este flujo de trabajo estándar:

1. Cambia a la rama "dev" y actualízala:
   ```bash
   git checkout dev
   git pull origin dev

2. Crea una nueva rama a partir de "dev" con el nombre de tu funcionalidad:
   ```bash
   git checkout -b nombre-de-tu-feature

3. Haz tus cambios, luego guarda y sube tu rama:
   ```bash
   git add .
   git commit -m "Descripción de lo que hiciste en ingles"
   git push -u origin nombre-de-tu-feature

4. Abre un Pull Request en GitHub:
   Base: dev
   Compare: nombre-de-tu-feature
   Espera aprobación del Scrum Master antes de hacer merge
