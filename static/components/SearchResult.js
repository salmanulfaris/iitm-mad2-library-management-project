import BookDetailsModal from "./Partials/BookDetailsModal.js";

export default ({
    data: () => ({
        searchResult: {}
    }),
    methods: {
        search() {
            fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({'search': this.$route.query.search_value}),
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json()).then((data) => {
                this.searchResult = data
            })
        },
        showBookDetail(book) {

            this.$refs.bookModal.viewModal(book)
        }
    },
    watch: {
        '$route.params': { // Triggers the watcher immediately when the component is created
            handler(newParams, oldParams) {
                this.search()
            }
        }
    },
    created() {
        this.search()
    },
    components: {BookDetailsModal},

    template: `
        <div class="search pt-2 pb-5">
            <h4>Result in Books :</h4>
             <table class="table table-bordered">
                <thead>
                <tr>
                
                    <th>Book Title</th>
                    <th>Book Author</th>
                    <th>Action</th>
                </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(book,i) in searchResult.books">
                        <td>{{book.title}}</td>
                        <td>{{book.author}}</td>
                        <td >
                        <button class="btn btn-primary" @click="showBookDetail(book)">View Book</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <h4>Result in Section :</h4>
            <table class="table table-bordered">
                <thead>
                <tr>
                
                    <th>Section Name</th>
                    <th>Description</th>
                    <th>Action</th>
                </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(section,i) in searchResult.sections">
                        <td>{{section.section_name}}</td>
                        <td>{{section.section_description}}</td>
                        <td >
                        <button class="btn btn-primary " >
                        <router-link class="text-white" :to="'/section/'+section.section_id">
                            View Section
                        </router-link>
                        </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <BookDetailsModal ref="bookModal"/>
            
        </div>
    `,


})