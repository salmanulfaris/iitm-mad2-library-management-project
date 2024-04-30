import Book from './Partials/Book.js';
import BookDetailsModal from "./Partials/BookDetailsModal.js";


export default ({
    data: () => ({
        loading: false,
        new_book: {
            title: '',
            content: '',
            author: '',
            image: '',
            section: '',
            prologue: ''
        },
        bookList: [],
        sections: [],
        bootstrap_modal: {}
    }),
    methods: {
        getAllSections() {
            fetch('/api/section', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.sections = data
            })
        },
        addBook() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.bookImage.files[0]);
            formData.append('title', this.new_book.title);
            formData.append('author', this.new_book.author);
            formData.append('content', this.new_book.content);
            formData.append('section', this.new_book.section);
            formData.append('prologue', this.new_book.prologue);


            fetch('/api/book', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'POST',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.getAllBooks()
                    this.bootstrap_modal.hide()
                    this.new_book = {
                        title: '',
                        content: '',
                        author: '',
                        image: '',
                        section: ''
                    }
                }else {
                    let data = await res.json()
                    alert(data.message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        attachImage() {
            this.book.image = this.$refs.bookImage.files[0];
        },
        getAllBooks() {
            fetch('/api/book', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.bookList = data
            })
        },
        showBookDetail(book) {
            this.$refs.bookModal.viewModal(book)
        }

    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('addNewBookModal'));

    },
    created() {
        this.getAllBooks()
        this.getAllSections()
    },
    computed: {
        role() {
            return localStorage.getItem('role')
        }
    },
    components: {Book, BookDetailsModal},
    template: `
        <div class="pb-5 mt-3">
        
            <!-- Button trigger modal -->


        <div class="px-3  mt-3">
    
        <div class="clearfix">
            <div class="float-start">
                <h2 class="mb-0">All Latest Books</h2>
            </div>
             <div class="float-end">
              <button type="button" v-if="role=='libr'" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addNewBookModal">
                    Add New Book
              </button>
            </div>
        </div>
      
            <div class="row  justify-content-left">
                <div class="col-lg-2 mt-3  " style="border-collapse: collapse;"  v-for="(book,i) in bookList" :key="i">
                    <Book 
                      @showDetail="showBookDetail"
                        :key="i" 
                        :book="book"
                    />            
                </div>   
            </div>
        </div>
        
<!-- Modal -->
         <div class="modal fade" id="addNewBookModal" tabindex="-1" aria-labelledby="addNewBookModalLabel" aria-hidden="true">
           <div class="modal-dialog modal-xl">
             <div class="modal-content">
               <div class="modal-header">
                 <h1 class="modal-title fs-5" id="addNewBookModalLabel">Add New Book</h1>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                 <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Title</label>
                            <input type="text" v-model="new_book.title" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Author</label>
                            <input type="text" v-model="new_book.author" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Cover</label>
                            <input type="file" ref="bookImage" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section</label>
                            <select v-model="new_book.section" class="form-select">
                                <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Prologue</label>
                            <textarea class="form-control" rows="3" maxlength="1000" v-model="new_book.prologue"></textarea>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Content</label>
                            <textarea class="form-control" rows="10" maxlength="7000" v-model="new_book.content"></textarea>
                        </div>
                    </div>
                 </div>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                 <button type="button" class="btn btn-primary" @click="addBook" :disabled="loading">
                    <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                    ADD BOOK
                 </button>
               </div>
             </div>
           </div>
         </div>
        
        <BookDetailsModal ref="bookModal"/>
         
        </div>
   `,


});