export default ({
    data: () => ({
        edit_book: {
            title: '',
            content: '',
            author: '',
            image: '',
            section_id: '',
            prologue: ''
        },
        sections: []
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
        getBookDetails() {
            fetch('/api/book/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                if (res.ok) {
                    this.edit_book = await res.json()
                }
            })
        },
        attachImage() {
            this.book.image = this.$refs.bookImage.files[0];
        },

        editBook() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.bookImage.files[0]);
            formData.append('title', this.edit_book.title);
            formData.append('author', this.edit_book.author);
            formData.append('content', this.edit_book.content);
            formData.append('section', this.edit_book.section_id);
            formData.append('prologue', this.edit_book.prologue);


            fetch('/api/book/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'PUT',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.getBookDetails()
                    alert("Updated Book Information Successfully")
                    this.edit_book = {
                        title: '',
                        content: '',
                        author: '',
                        image: '',
                        section_id: ''
                    }
                }
            }).finally(() => {
                this.loading = false;
            })
        },

    },
    created() {
        this.getBookDetails()
        this.getAllSections()
    },

    template: `
    <div class="px-5 mt-5 pb-5">
                <h4>Edit Book Info</h4>
                <hr>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Title</label>
                            <input type="text" v-model="edit_book.title" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Author</label>
                            <input type="text" v-model="edit_book.author" class="form-control">
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
                            <select v-model="edit_book.section_id" class="form-select">
                                <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Prologue</label>
                            <textarea class="form-control" rows="3" maxlength="1000" v-model="edit_book.prologue"></textarea>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Book Content</label>
                            <textarea class="form-control" rows="10" maxlength="7000" v-model="edit_book.content"></textarea>
                        </div>
                    </div>
                 </div>
                 <div class="text-end mt-3">
                    <button class="btn btn-primary" @click="editBook">Save</button>
</div>
    
    </div>
    `
})