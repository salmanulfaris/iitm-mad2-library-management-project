export default ({
    data: () => ({
        requests: []
    }),
    methods: {
        getPendingApprovals() {

            fetch('/api/book-requests', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(res => res.json())
                .then((res) => {
                    this.requests = res
                })

        },
        approveBook(book_id) {
            fetch('/api/approve-request/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        },
        rejectBook(book_id) {
            fetch('/api/reject-request/' + book_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        }
    },
    created() {
        this.getPendingApprovals();
    },
    template: `
    <div class="px-3 mt-4 pb-5">
            <h3>Pending Approvals</h3>
            <table class="table table-bordered table-striped">
                <thead>
                <tr>
                    <th>Book Name</th>
                    <th>User Name</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                    <tr v-for="request,i in requests.pending">
                        <td>{{request.book.title}}</td>
                        <td>{{request.user.name}}</td>
                        <td>
                            <button class="btn btn-sm btn-success" @click="approveBook(request.id)">Approve</button>
                            <button class="btn btn-sm btn-danger" @click="rejectBook(request.id)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>    
            
    </div>
        
    `
})