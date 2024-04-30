export default ({
    data: () => ({
        bookInfo: {
            feedbacks: []
        },
        isPlaying: false,
        bootstrap_modal: {},
        new_review: '',
        allowedToRead: false,

    }),
    computed: {
        wroteReview() {
            if (this.backInfo.feedbacks.length) {
                this.backInfo.feedbacks
            }
            return 'hii'
        },
        role() {
            return localStorage.getItem('role')
        },
    },
    methods: {
        returnBook(book_id) {
            fetch('/api/return-request/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getBooksDetails()
                    }
                })
        },
        getBooksDetails() {
            this.allowedToRead = false;
            fetch("/api/book/" + this.$route.params.id, {
                method: "GET",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then((res) => res.json()).then((res) => {
                this.bookInfo = res;
                if (this.bookInfo.is_approved_for_me) {
                    this.allowedToRead = true;
                }
            })
        },
        playPause() {
            // this.isPlaying = !this.isPlaying
            var msg = new SpeechSynthesisUtterance();

            msg.text = this.bookInfo.content;
            window.speechSynthesis.speak(msg);
        },
        submitReview() {
            fetch("/api/review/" + this.bookInfo.book_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({review: this.new_review})
            }).then(() => {
                this.new_review = ''
                this.bootstrap_modal.hide()
                this.getBooksDetails()
            })
        },
        deleteBook(){
            let x = confirm("This will delete all related data from the server ? Are you sure ?")
            if(!x){
                return ;
            }
            fetch("/api/book/" + this.bookInfo.book_id, {
                method: "DELETE",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                }
            }).then((res) => {
                if(res.ok){
                    alert("Delete Book Successfully")
                    this.$router.push({name:"Login"})
                }
            })
        }

    },
    mounted() {
        this.getBooksDetails()
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('bookReviewModal'));

    },
    template: `
    <div class="px-3 pt-3 pb-5">
        <div class="clearfix my-2">
            <div class="float-start">
                <h1>Title : {{bookInfo.title}}</h1> 
                <template v-if="role=='member'">
                
                <button class="btn btn-sm btn-danger" v-if="bookInfo.is_approved_for_me" @click="returnBook(bookInfo.request_id)">Return Book</button>
                
       
                </template>
                <template v-else>
                    <router-link class="text-white" :to="'/edit-book/'+bookInfo.book_id">
                         <button class="btn btn-sm btn-primary"  >
                            Edit
                        </button>
                    </router-link>
                         <button class="btn btn-sm btn-danger"  @click="deleteBook()" >
                            Delete The Book
                        </button>
                </template>
                <button class="btn btn-sm btn-info"  v-if="!bookInfo.wrote_review" data-bs-toggle="modal" data-bs-target="#bookReviewModal">Write a Review</button>
                
           
            </div>    
            <div class="float-end">
                <img height="150" :src="'static/uploaded/'+bookInfo.image" alt="Book Image" />
            </div>    
        </div>
        <h5>Content : </h5>
        <hr>
<!--        <button class="btn btn-primary" @click="playPause">Play/Pause</button>-->
        <p class="fs-regular text-break fw-light" v-if="allowedToRead||role=='libr'">{{bookInfo.content}}</p>         
        <div class="alert alert-danger" v-else>
            You Don't access to read this book.
        </div>
        <h5>Reviews : </h5>
        <hr>
        <div class="row">
            <div class="col-lg-4" v-for="(feedback,i) in  bookInfo.feedbacks" :key="i">
                <div class="card">
                <div class="card-header">{{feedback.user.name}}</div>
                <div class="card-body">{{feedback.feedback}}</div>
                </div>
            </div>
        </div>
        
        
        
        <!-- Modal -->
        <div class="modal fade" id="bookReviewModal" tabindex="-1" aria-labelledby="bookReviewModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="bookReviewModalLabel">Add Review for {{bookInfo.title}}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
              <div class="form-group">
              
                <label>Write Review</label>
                <textarea v-model="new_review" class="form-control" id="" cols="30" rows="10"></textarea>
              </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click="submitReview">SUBMIT</button>
              </div>
            </div>
          </div>
        </div>
    </div>
    
    `
})




