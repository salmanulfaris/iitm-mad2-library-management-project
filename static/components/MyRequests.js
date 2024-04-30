export default ({
    data: () => ({
        myRequests: []
    }),
    methods: {
        getRequests() {
            fetch('/api/my-requests', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(async (res) => {
                if (res.ok) {
                    this.myRequests = await res.json()
                }
            })
        }
    },
    created(){
        this.getRequests()
    },
    template: `
        <div class="px-5 mt-5 pb-5">
                <h4>My Book Recent Request</h4>
                <hr>
                <div class="row">
                    <div class="col-lg-12">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Book Name</th>
                                    <th>Status</th>
                                </tr>
                            
                            </thead>
                            <tbody>
                                <tr v-for="request,i in myRequests" :key="i">
                                    <td>{{request.book.title}}</td>
                                    <td>
                                        <template v-if="request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">
                                            Issued on {{request.issue_date}}
                                            <button  class="btn btn-primary text-white" style="text-decoration: none">
                                                <router-link class="text-white" :to="'read/'+request.book.book_id">
                                                    Read
                                                </router-link>
                                            </button>
                                        </template>
                                        <template v-if="!request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">Pending</template>
                                        <template v-if="!request.is_approved && request.is_rejected">Rejected</template>
                                        <template v-if="request.is_approved && request.is_returned ">Returned on {{request.return_date}}</template>
                                        <template v-if="request.is_approved && request.is_revoked ">Revoked Access</template>
                                    </td>
                                </tr>
                            </tbody>
 

                        </table>
                    </div>
                </div>
        </div>  
                    
                  
    
    `
})