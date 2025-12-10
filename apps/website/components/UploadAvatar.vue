<template>
  <div class="upload upload--avatar">
    <div class="upload--avatar__grid">
      <!-- Avatar actual o subir nuevo -->
      <div
        :class="{ 'is-active': avatar }"
        class="upload--avatar__input"
        @click="handleFileOpen"
      >
        <img
          class="upload--images__input__image"
          :src="image?.url || ''"
          alt="Imagen"
        />
        <button
          v-if="avatar"
          class="upload--avatar__input__button"
          type="button"
          @click.stop="handleRemoveImage(avatar)"
        >
          <img
            loading="lazy"
            :src="addCircleSharp"
            alt="Eliminar avatar"
            title="Eliminar avatar"
          />
        </button>
        <img
          v-else
          loading="lazy"
          :src="addCircleSharp"
          alt="Subir avatar"
          title="Subir avatar"
        />
      </div>
    </div>

    <div class="upload--avatar__information">
      <img
        loading="lazy"
        decoding="async"
        :src="iconInfo"
        alt="Icon Info"
        title="Icon Info"
      />
      <p>Sube una foto de perfil para personalizar tu cuenta.</p>
    </div>
    <input
      ref="fileInput"
      type="file"
      name="avatar"
      accept="image/*"
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
const avatar = ref(null);

// Cargar el avatar inicial cuando el componente se monta
onMounted(() => {
  if (user.value?.avatar) {
    avatar.value = transformUrl(user.value.avatar.url);
  }

  // Ocultar el input file usando setProperty
  if (fileInput.value) {
    fileInput.value.style.setProperty("visibility", "hidden");
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
    if (img.width < 200 || img.height < 200) {
      Swal.fire({
        text: "La imagen debe tener al menos 200x200 píxeles.",
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
  document.body.style.cursor = "wait";

  try {
    const uploadedImage = await uploadFile(form.value.file, "avatar");
    // Actualizar el avatar del usuario con el id de la imagen subida
    await updateUserAvatar(uploadedImage);
    // Actualizar el avatar en el frontend con la URL de la imagen subida
    avatar.value = transformUrl(uploadedImage.url);
    fileInput.value.value = "";

    Swal.fire({
      text: "Avatar subido y actualizado correctamente",
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
    document.body.style.cursor = "default";
  }
};

const updateUserAvatar = async (image) => {
  try {
    const strapi = useStrapi();
    await strapi.update("users/avatar", {
      avatar: image.id,
    });
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  } catch {
    Swal.fire({
      text: "¡Error al actualizar el avatar! Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const handleRemoveImage = (image) => {
  if (isProcessing.value) return;

  Swal.fire({
    text: "¿Estás seguro de eliminar tu foto de perfil?",
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
  document.body.style.cursor = "wait";

  try {
    const strapi = useStrapi();
    // Primero eliminamos el avatar
    await strapi.update("users/avatar", {
      avatarId: null,
    });

    // Actualizamos el usuario en el frontend
    const { fetchUser } = useStrapiAuth();
    await fetchUser();

    // Limpiamos el avatar local
    avatar.value = null;

    // Recargamos la página para actualizar todos los componentes que muestran el avatar
    window.location.reload();

    Swal.fire({
      text: "Foto de perfil eliminada exitosamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch {
    Swal.fire({
      text: "¡Error al eliminar la foto de perfil! Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    isProcessing.value = false;
    document.body.style.cursor = "default";
  }
};
</script>
