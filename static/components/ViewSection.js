import Book from "./Partials/Book.js";
import BookDetailsModal from "./Partials/BookDetailsModal.js";

export default ({
    data: () => ({
        view_section: {books:[]}
    }),
    methods: {
        getSectionDetails() {
            fetch('/api/section/' + this.$route.params.id, {
               headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(res => res.json()).then((data) => {
                this.view_section = data
            })
        },
        showBookDetail(book) {
            book.section = this.view_section
            this.$refs.bookModal.viewModal(book)
        }
    },
    created() {
        this.getSectionDetails()
    },
    components: {Book, BookDetailsModal},
    template: `
        <div class="px-3  pb-5">
            <div class="clearfix mt-3">
                <div class="float-start">
                    <h3>Section : {{view_section.section_name}}</h3>     
                              
                </div>
                <div class="float-end">
                    <p class="my-0">Description : {{view_section.section_description}}</p>                          
                    <p>Date Created : {{view_section.date_created}}</p>   
                 </div>
            </div>
            <h5 class="mb-0">Book Under this Section: </h5>
            <hr>
            <div class="row">
                <div class="card text-danger border-danger mt-2" v-if="view_section.books.length==0">
                    <div class="card-body">
                        <h5>
                            No Books found in this section
                        </h5>
                    </div>
                </div>
                <div class="col-lg-2 mt-3  " style="border-collapse: collapse;"  v-for="(book,i) in view_section.books" :key="i">
                    <Book 
                        @showDetail="showBookDetail"
                        :key="i" 
                        :book="book"
                    />            
                </div>       
            </div>
                  
            <BookDetailsModal ref="bookModal"/>
            
            
        </div>
    `
})