export default ({
    data: () => ({
        loading: false,
        new_section: {
            section_name: '',
            section_description: '',
        },
        sections: [],
        bootstrap_modal: {},
        edit_bootstrap_modal: {},
        edit_section: {}
    }),
    computed: {
        role() {
            return localStorage.getItem('role')
        }
    },
    template: `
        <div class="pb-5 mt-3">
        
            <!-- Button trigger modal -->


        <div class="px-3  mt-3">
    
        <div class="clearfix">
            <div class="float-start">
            
                <h3 class="mb-0">All Sections</h3>
            </div>
             <div class="float-end">
              <button type="button" v-if="role=='libr'" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addNewBookModal">
                    Add New Section
              </button>
            </div>
        </div>
      
            <div class="row  justify-content-left">
                <div class="col-lg-3 mt-3  " style="border-collapse: collapse;"  v-for="(section,i) in sections" :key="i">
                    <div class="card border-success">
                     <div class="card-header text-success">
                               <div class="clearfix">
                                    <div class="float-start">
                                    {{section.section_name}}
                                             
                                    </div>
                                    <div class="float-end">
                                         <button class="btn btn-warning btn-sm" v-if="role=='libr'" @click="editSection(section.section_id)">Edit</button>
                                         <button class="btn btn-danger btn-sm" v-if="role=='libr'" @click="deleteEdit(section.section_id)">Delete</button>
                                         <button class="btn btn-success btn-sm">
                                             <router-link class="text-white" :to="'/section/'+section.section_id">
                                                View
                                            </router-link>
                                        </button>
                                    </div>
                                </div>
                        
                      </div>
                    <div class="card-body fs-regular">
                           About :  {{section.section_description}}
                    </div>
                    </div>         
                </div>   
            </div>
        </div>
        
<!-- Modal -->
         <div class="modal fade" id="addNewBookModal" tabindex="-1" aria-labelledby="addNewBookModalLabel" aria-hidden="true">
           <div class="modal-dialog modal-lg">
             <div class="modal-content">
               <div class="modal-header">
                 <h1 class="modal-title fs-5" id="addNewBookModalLabel">Add New Section</h1>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                 <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section Name</label>
                            <input type="text" v-model="new_section.section_name" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section Description</label>
                            <textarea class="form-control"  v-model="new_section.section_description"></textarea>
                        </div>
                    </div>
                 </div>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                 <button type="button" class="btn btn-success" @click="addSection" :disabled="loading">
                    <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                    ADD SECTION
                 </button>
               </div>
             </div>
           </div>
         </div>
        
        
             <div class="modal fade" id="editBookModal" tabindex="-1" aria-labelledby="editBookModalLabel" aria-hidden="true">
           <div class="modal-dialog modal-lg">
             <div class="modal-content">
               <div class="modal-header">
                 <h1 class="modal-title fs-5" id="editBookModalLabel">Edit Section</h1>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                 <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section Name</label>
                            <input type="text" v-model="edit_section.section_name" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section Description</label>
                            <textarea class="form-control" rows="5"  v-model="edit_section.section_description"></textarea>
                        </div>
                    </div>
                 </div>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                 <button type="button" class="btn btn-success" @click="saveSection" :disabled="loading">
                    <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                    SAVE SECTION
                 </button>
               </div>
             </div>
           </div>
         </div>
        </div>
   `,
    methods: {
        editSection(section_id) {
            this.edit_bootstrap_modal.show();
            fetch('/api/section/' + section_id, {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.edit_section = data
            })
        },
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
        saveSection() {
            this.loading = true;
            fetch('/api/section/' + this.edit_section.section_id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')

                },
                body: JSON.stringify(this.edit_section)
            }).then(async (res) => {
                if (res.ok) {
                    this.getAllSections()
                    this.edit_bootstrap_modal.hide()
                    this.edit_section = {
                        section_name: '',
                        section_description: ''
                    }
                }else {
                    let data =await res.json()
                    alert(data.message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        addSection() {
            this.loading = true;
            fetch('/api/section', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')

                },
                body: JSON.stringify(this.new_section)
            }).then(async (res) => {
                if (res.ok) {
                    this.getAllSections()
                    this.bootstrap_modal.hide()
                    this.new_section = {
                        section_name: '',
                        section_description: ''
                    }
                }else {
                    let data =await res.json()
                    alert(data.message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        deleteEdit(section_id) {
            let co = confirm("Are you sure you want to delete this section?");
            if (!co) {
                return;
            }
            fetch('/api/section/' + section_id, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem('auth-token')

                },
            }).then(async (res) => {
                if (res.ok) {
                    this.getAllSections()
                }
            })
        }


    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('addNewBookModal'));
        this.edit_bootstrap_modal = new bootstrap.Modal(document.getElementById('editBookModal'));

    },
    created() {
        this.getAllSections()
    }

});