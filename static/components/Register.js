export default ({
    data: () => ({
        user: {
            email: '',
            name: '',
            password: ''
        },
        error:''
    }),
    methods: {
        async register() {
            fetch('/user-register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.user)
                }
            )

                .then(async (res) => {
                    const data = await res.json();
                    if (res.ok) {
                        localStorage.setItem('auth-token', data.token)
                        localStorage.setItem('role', data.role)
                        this.$router.push({path: '/'})
                    } else {
                        this.error = data.message
                    }

                });
        }
    },
    template: `
    <div class="row">
        <div class="col-lg-6 pb-5" style="height:100vh;background:url('static/img/renaissance.jpg');background-size:cover;">
        </div>
        <div class="col-lg-6">
        <div class="row justify-content-center">
        <div class="col-lg-6">
                <div  style="margin-top: 140px">
                <h3>Register </h3>
                <div class="alert alert-danger" v-if="error!=''">
                    {{error}}
                </div>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text"  v-model="user.name" class="form-control"/>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="user.email"  class="form-control"/>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password"  v-model="user.password" class="form-control"/>
                </div>
                <div class="form-group mt-3">
                    <button class="btn btn-dark" @click="register">
                        REGISTER
                    </button>
                </div>
                <p class="mb-0 mt-2 ">Already a member ?</p>
                <router-link to="/login">Login</router-link>
            </div>
        </div>
        </div>
        </div>
    </div>
    `
})