<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs-12 sm-6 class='text-sm-right text-xs-center'>
                <v-btn large router to="/meetups" class='primary'>View Meetups</v-btn>
            </v-flex>
            <v-flex xs-12 sm-6 class='text-sm-left text-xs-center'>
                <v-btn large router to="/createMeetups/new" class='primary'>Create Meetups</v-btn>
            </v-flex>
        </v-layout>

        <v-layout>
            <v-flex xs12 class="text-xs-center">
                <v-progress-circular indeterminate class="primary--text" :width="7" :size="70" v-if="loading">

                </v-progress-circular>
            </v-flex>
        </v-layout>

        <v-layout row wrap class='mt-2' v-if="!loading">
            <v-flex xs-12>
                <v-carousel style="cursor: pointer">
                    <v-carousel-item
                    v-for = "meetup in meetups"
                    :src = "meetup.imageUrl"
                    :key = "meetup.id"
                    @click="onLoadMeetup(meetup.id)"
                    >
                        <div class='title'>
                            {{meetup.title}}
                        </div>
                    </v-carousel-item>
                </v-carousel>
            </v-flex>
        </v-layout>

        <v-layout row wrap class='mt-2'>
            <v-flex xs-12='text-sm-right text-xs-center'>
                <p class='carousel-paragraph'>Join Our awesome meetups!</p>
            </v-flex>
        </v-layout>

    </v-container>
</template>

<script>
export default {
    computed: {
        meetups (){
            return this.$store.getters.featuredMeetups
        },
        loading () {
            return this.$store.getters.loading
        }
    },
    methods:{
        onLoadMeetup (id) {
            this.$router.push('/meetup/'+id)
        }
    }
}
</script>

<style scoped>
    .title{
        position: absolute;
        bottom: 50px;
        left: 0;
        right: 0;
        
        background-color: rgba(0, 0, 0, .5);
        color: white;
        font-size: 2em;
        text-align: center;
    }

    .carousel-paragraph{
        text-align: center;
    }
</style>
