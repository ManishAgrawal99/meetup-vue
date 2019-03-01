<template>
    <v-container>
        <v-layout row>
            <v-flex xs12 sm6 offset-sm3>
                <h2 class="primary--text">Create a new Meetup</h2>
            </v-flex>
        </v-layout>
        <v-layout row>
            <v-flex xs12>
                <v-form @submit.prevent="onCreateMeetup">
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field
                                name="title"
                                label="Title"
                                id="title"
                                v-model="title"
                                required
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field
                                name="location"
                                label="Location"
                                id="location"
                                v-model="location"
                                required
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-btn raised class="primary" @click="onPickFile">Upload Image</v-btn>
                            <input type="file" style="display: none" ref="fileInput" accept="image/*" @change="onFilePicked">
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <img :src="imageUrl" height="150">
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-text-field
                                name="description"
                                label="Description"
                                id="description"
                                v-model="description"
                                multi-line
                                required
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <h4>Choose a date and time</h4>
                        </v-flex>
                    </v-layout>
                    <v-layout row class="mb-2">
                        <v-flex xs12 sm6 offset-sm3>
                            <v-date-picker v-model="date"></v-date-picker>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-time-picker v-model="time"></v-time-picker>
                            <p class="accent--text">{{ submittableDateTime | date }}</p>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs12 sm6 offset-sm3>
                            <v-btn 
                            class="primary" 
                            :disabled="!formIsValid"
                            type="submit"
                            >Create Meetup</v-btn>
                        </v-flex>
                    </v-layout>
                </v-form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import moment from 'moment'

export default {
    data () {
        return {
            title: '',
            location: '',
            imageUrl: '',
            description: '',
            date: new Date(),
            time: new Date(),
            image: null
        }
    },
    created: function(){
        const dateTime = moment()
        this.date = dateTime.format('YYYY-MM-DD').toString()
        this.time = dateTime.format('HH:mm').toString()
    },
    computed: {
        formIsValid () {
            return this.title !== '' && this.location !== '' && this.imageUrl !== '' && this.description !== ''
        },
        submittableDateTime () {
            const date = new Date(this.date)
            if(typeof this.time === 'string'){
                const hours = this.time.match(/^(\d+)/)[1]
                const minutes = this.time.match(/:(\d+)/)[1]
                date.setHours(hours)
                date.setMinutes(minutes)
            }else{
                date.setHours(this.time.getHours())
                date.setMinutes(this.time.getMinutes())
            }
            //console.log(date)
            return date
        }
        
    },
    methods: {
        onCreateMeetup () {
            if (!this.formIsValid){
                return
            }
            if(!this.image){
                //If the file is empty, we do not store it 
                return
            }
            const meetupData = {
                title: this.title,
                location: this.location,
                //We cannot store the base 64 file in the DB since that will be a very long string and not nice to see
                //So we store the binary file in the DB
                image: this.image,
                description: this.description,
                date: this.submittableDateTime
            }
            this.$store.dispatch('createMeetup', meetupData)
            this.$router.push('/meetups')
        },
        onPickFile () {
            this.$refs.fileInput.click();
        },
        onFilePicked (event) {
            const files = event.target.files
            let filename = files[0].name
            if (filename.lastIndexOf('.') <= 0){
                return alert('Please enter a valid file')
            }
            //Now we want to convert the binary file into a string value using the JS file reader API
            const fileReader = new FileReader()
            fileReader.addEventListener('load', () =>{
                this.imageUrl = fileReader.result
            })
            fileReader.readAsDataURL(files[0])
            this.image = files[0]
        }
    }
}
</script>

