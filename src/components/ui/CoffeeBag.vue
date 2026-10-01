<script setup lang="ts">
/**
 * Product shot of a Secawan pouch, rendered in Blender (design/blender: "Secawan Bags" scene)
 * with each coffee's printed label wrapped onto the kraft front.
 */
withDefaults(
  defineProps<{
    productId: string
    name: string
    roast: 'Light' | 'Medium' | 'Dark'
    /** Small thumbnails (cart) can skip lazy loading since the drawer is opened on demand */
    eager?: boolean
  }>(),
  { eager: false },
)

const base = import.meta.env.BASE_URL
</script>

<template>
  <img
    class="bag"
    :src="`${base}images/bags/${productId}.webp`"
    :alt="`${name} coffee pouch, ${roast.toLowerCase()} roast`"
    width="720"
    height="800"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
    draggable="false"
  />
</template>

<style scoped>
.bag {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}
</style>
