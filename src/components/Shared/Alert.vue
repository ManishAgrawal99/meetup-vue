<template>
    <v-alert
      @input="onClose"
      dismissible
      type="error"
      :value="true"
    >
    {{ text }}
    </v-alert>
</template>

<script>
export default {
    props: [
        'text'
    ],
    methods: {
        onClose(){
            this.$emit('dismissed')
        }
    }
}
</script>
