export default ({
    data: () => ({
        bootstrap_modal: {},
        bookInfo: {
            section: '',
            requests: []
        },
    }),
    methods: {
        markAsFavorite(book_id){
            fetch('/api/book/mark_as_fav/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                this.getBookDetails(book_id)
            })
        },
        viewModal(book) {
            this.bookInfo = book
            this.getBookDetails(book.book_id)
            this.bootstrap_modal.show()
        },
        getBookDetails(book_id) {
            fetch('/api/book/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                if (res.ok) {
                    this.bookInfo = await res.json()
                }
            })
        },
        approveBook(request_id) {
            fetch('/api/approve-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getBookDetails(this.bookInfo.book_id)
                    }
                })
        },
        revokeBook(request_id) {
            fetch('/api/revoke-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getBookDetails(this.bookInfo.book_id)
                    }
                })
        },
        requestBookForReading(book_id) {
            fetch(`/api/request-book/${book_id}`, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(async (res) => {
                if (res.ok) {
                    this.getBookDetails(book_id)
                }
            })
        },
        rejectBook(request_id) {
            fetch('/api/reject-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getBookDetails(request_id)
                    }
                })
        }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('viewBookDetailsModal'));
    },
    computed: {
        role() {
            return localStorage.getItem('role')
        },
        imagePath: function () {
            if (this.bookInfo.hasOwnProperty('image')) {
                if (this.bookInfo.image == "") {
                    return "static/img/wall-paint.jpg";
                } else {
                    return "static/uploaded/" + this.bookInfo.image;
                }
            } else {
                return ''
            }
        }

    },
    template: `
        <!-- Modal -->
<div>
    <div class="modal fade" id="viewBookDetailsModal" tabindex="-1" aria-labelledby="viewBookDetailsModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewBookDetailsModalLabel">Book Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-lg-5 text-center mx-auto">
                            <div class="mx-auto">
                                <img class="mx-auto" :alt="bookInfo.title" style="max-width: 100%; height: 500px"
                                     :src="imagePath"/>
                            </div>
                        </div>

                        <div class="col-lg-7">
                        <div class="clearfix">
                            <div class="float-start">
                                 <h2>
                                    {{ bookInfo.title }}
                                </h2>
                            </div>
                            <div class="float-end"  v-if="role=='libr'">
                                <router-link class="text-white" :to="'/edit-book/'+bookInfo.book_id">
                                    <button class="btn btn-primary" data-bs-dismiss="modal" >
                                        Edit
                                    </button>
                                </router-link>
                                <router-link class="text-white" :to="'/read/'+bookInfo.book_id">
                                    <button class="btn btn-warning" data-bs-dismiss="modal" >
                                        View/Manage Book
                                    </button>
                                </router-link>
                            </div>
                        </div>
                           
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
                                            data-bs-target="#home" type="button" role="tab" aria-controls="home"
                                            aria-selected="true">About Book
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation"  v-if="role=='libr'">
                                    <button class="nav-link" id="profile-tab" data-bs-toggle="tab"
                                            data-bs-target="#profile" type="button" role="tab" aria-controls="profile"
                                            aria-selected="false">Issued to
                                    </button>
                                </li>
                            </ul>
                            <div class="tab-content mt-2" id="myTabContent">
                                <div class="tab-pane fade show active"  id="home" role="tabpanel"
                                     aria-labelledby="home-tab">
                                    <div class="fs-regular">
                                        <p class="mb-0">Author : {{ bookInfo.author }} </p>
                                        <span class="badge bg-secondary">Section : {{ bookInfo.section.section_name }} </span>
                                        <p class="mb-0 mt-4">Prologue :</p>
                                        <p class="fs-regular"> {{ bookInfo.prologue }} </p>
                                    </div>
                                    <template  v-if="role!='libr'">
                                        <button v-if="bookInfo.is_approved_for_me" data-bs-dismiss="modal"
                                                class="btn btn-primary text-white" style="text-decoration: none">
                                            <router-link class="text-white" :to="'read/'+bookInfo.book_id">
                                                Read
                                            </router-link>
                                        </button>
    
                                        <button v-if="bookInfo.is_pending_for_me" type="button" class="btn btn-danger"
                                                disabled>
                                            <template>Approval Pending For this Book</template>
                                        </button>
    
                                        <template v-if="bookInfo.num_of_book_pending_for_me >5">
                                                <div class="alert alert-danger">You can only request/read maximum of 5 books at a time. So, you need return current approved book or need to wait till book till approved</div>
                                        </template>
                  
                                                 <button v-if="!bookInfo.is_pending_for_me && !bookInfo.is_approved_for_me"
                                                 :disabled="bookInfo.num_of_book_pending_for_me >5"
                                                        type="button" class="btn btn-primary"
                                                        @click="requestBookForReading(bookInfo.book_id)">
                                                    Request This Book
                                                </button>              
                                   
  
                                    </template>
                                    
                                </div>
                                <div class="tab-pane fade" v-if="role=='libr'" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <table class="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th>User Name</th>
                                            <th>Issued at</th>
                                            <th>Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="request,i in bookInfo.requests" :key="i" v-if="!request.is_approved && !request.is_rejected">
                                            <td>{{request.user.name}}</td>
                                            <td>Pending</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" @click="approveBook(request.id)">Approve</button>
                                                <button class="btn btn-sm btn-danger" @click="rejectBook(request.id)">Reject</button>
                                            </td>
                                        </tr>
                                        
                                        <tr v-for="request,i in bookInfo.requests" :key="i" v-if="request.is_approved && !request.is_rejected && !request.is_returned && !request.is_revoked">
                                            <td>{{request.user.name}}</td>
                                            <td>{{request.issue_date}}</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" @click="revokeBook(request.id)">Revoke Access</button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" @click="markAsFavorite(bookInfo.book_id)">Mark this book as Favorite</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
        
    `,

})