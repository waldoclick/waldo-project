<template>
  <div class="upload upload--cover">
    <div class="upload--cover__grid">
      <!-- <pre>{{ user }}</pre> -->
      <!-- Cover actual o subir nuevo -->
      <div
        :class="{ 'is-active': cover }"
        class="upload--cover__input"
        @click="handleFileOpen"
      >
        <img
          class="upload--images__input__image"
          :src="image?.url || ''"
          alt="Imagen"
        />
        <button
          v-if="cover"
          class="upload--cover__input__button"
          type="button"
          @click.stop="handleRemoveImage(cover)"
        >
          <img
            loading="lazy"
            :src="addCircleSharp"
            alt="Eliminar portada"
            title="Eliminar portada"
          />
        </button>
        <img
          v-else
          loading="lazy"
          :src="addCircleSharp"
          alt="Subir portada"
          title="Subir portada"
        />
      </div>
    </div>

    <div class="upload--cover__information">
      <img
        loading="lazy"
        decoding="async"
        :src="iconInfo"
        alt="Icon Info"
        title="Icon Info"
      />
      <p>Sube una imagen de portada para personalizar tu perfil.</p>
    </div>
    <input
      ref="fileInput"
      type="file"
      name="cover"
      accept="image/*"
      class="upload--hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const { Swal } = useSweetAlert2();
import { useRuntimeConfig } from "#app";

// Importar imágenes desde el directorio static
import addCircleSharp from "/images/add-circle-sharp.svg";
import iconInfo from "/images/icon-info.svg";

// Accede a la configuración de runtime
const user = useStrapiUser();
const { transformUrl, uploadFile } = useImageProxy();

const form = ref({
  file: undefined,
});

const fileInput = ref(null);
const isProcessing = ref(false);
const cover = ref(null);

// Cargar el cover inicial cuando el componente se monta
onMounted(() => {
  if (user.value?.cover) {
    cover.value = transformUrl(user.value.cover.url);
  }
});

const handleFileOpen = () => {
  if (!isProcessing.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  const validTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!validTypes.includes(file.type)) {
    Swal.fire({
      text: "Solo se permiten imágenes en formato JPG, PNG o WebP.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
    return;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.addEventListener("load", () => {
    if (img.width < 1200 || img.height < 400) {
      Swal.fire({
        text: "La imagen debe tener al menos 1200x400 píxeles.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    form.value.file = file;
    handleUpload();
  });
};

const handleUpload = async () => {
  isProcessing.value = true;
  document.body.classList.add("cursor-wait");

  try {
    const uploadedImage = await uploadFile(form.value.file, "cover");
    // Actualizar el cover del usuario con el id de la imagen subida
    await updateUserCover(uploadedImage);
    // Actualizar el cover en el frontend con la URL de la imagen subida
    cover.value = transformUrl(uploadedImage.url);
    fileInput.value.value = "";

    Swal.fire({
      text: "Portada subida y actualizada correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    console.error("Upload error:", error);
    Swal.fire({
      text: "¡Error al subir la imagen! Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};

const updateUserCover = async (image) => {
  try {
    const strapi = useStrapi();
    await strapi.update("users/cover", {
      cover: image.id,
    });
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  } catch {
    Swal.fire({
      text: "¡Error al actualizar la portada! Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const handleRemoveImage = (image) => {
  if (isProcessing.value) return;

  Swal.fire({
    text: "¿Estás seguro de eliminar tu imagen de portada?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      removeImage(image);
    }
  });
};

const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.classList.add("cursor-wait");

  try {
    const strapi = useStrapi();
    // Primero eliminamos el cover
    await strapi.update("users/cover", {
      coverId: null,
    });

    // Actualizamos el usuario en el frontend
    const { fetchUser } = useStrapiAuth();
    await fetchUser();

    // Limpiamos el cover local
    cover.value = null;

    // Recargamos la página para actualizar todos los componentes que muestran el cover
    window.location.reload();

    Swal.fire({
      text: "Imagen de portada eliminada exitosamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch {
    Swal.fire({
      text: "¡Error al eliminar la imagen de portada! Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    isProcessing.value = false;
    document.body.classList.remove("cursor-wait");
  }
};
</script>
