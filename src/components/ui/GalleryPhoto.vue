<script setup lang="ts">
/** A Blender-rendered still from the gallery set (design/blender: "Secawan Gallery" scene). */
withDefaults(defineProps<{ image: string; alt: string; eager?: boolean }>(), { eager: false })

const base = import.meta.env.BASE_URL
</script>

<template>
  <img
    class="photo"
    :src="`${base}images/gallery/${image}.webp`"
    :alt="alt"
    width="800"
    height="1000"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    draggable="false"
  />
</template>

<style scoped>
.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}
</style>
