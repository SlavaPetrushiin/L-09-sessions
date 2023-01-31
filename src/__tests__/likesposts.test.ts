import request from 'supertest'
import { app } from '../app'
import { runDB } from '../repositories/db'

const BLOG_MODEL = {
    name: "Test in jest",
    description: 'blogDescription',
    websiteUrl: 'https://someurl1.com',
}

const POST_MODEL_1 = {
    title: "post 1",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

const POST_MODEL_2 = {
    title: "post 2",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

const POST_MODEL_3 = {
    title: "post 3",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

const POST_MODEL_4 = {
    title: "post 4",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

const POST_MODEL_5 = {
    title: "post 5",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

const POST_MODEL_6 = {
    title: "post 6",
    shortDescription: "postDescription2",
    content: "i like js in too much",
}

enum TypesLikes {
    like = "Like",
    dislike = "Dislike",
    none = "None"
}

jest.setTimeout(10000)
describe('/users', () => {

    beforeAll(async () => {
        await runDB()
    })

    //Users
    let inputModelUser1 = {
        login: 'login-1',
        password: "password-1",
        email: "test@yandex.by",
    }
    let inputModelUser2 = {
        login: 'login-2',
        password: "password-2",
        email: "test2@yandex.by",
    }
    let inputModelUser3 = {
        login: 'login-3',
        password: "password-3",
        email: "test3@yandex.by",
    }
    let inputModelUser4 = {
        login: 'login-4',
        password: "password-4",
        email: "test4@yandex.by",
    }

    //UsersLogins
    let correctInputModelAuth1 = {
        loginOrEmail: 'login-1',
        password: "password-1",
    }
    let correctInputModelAuth2 = {
        loginOrEmail: 'login-2',
        password: "password-2",
    }
    let correctInputModelAuth3 = {
        loginOrEmail: 'login-3',
        password: "password-3",
    }
    let correctInputModelAuth4 = {
        loginOrEmail: 'login-4',
        password: "password-4",
    }

    let tokens = {
        token_user_1: "",
        token_user_2: "",
        token_user_3: "",
        token_user_4: ""
    }

    let cookie: any = [];
    let blog, post_1, post_2, post_3, post_4, post_5, post_6;
    let postId1 = "", postId2 = "", postId3 = "", postId4 = "", postId5 = "", postId6 = "";

    it('should delete all data', async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    it('created 4 user, one blog, 6 posts', async () => {
        //Registration users
        await request(app)
            .post('/auth/registration')
            .send(inputModelUser1)
        await request(app)
            .post('/auth/registration')
            .send(inputModelUser2)
        await request(app)
            .post('/auth/registration')
            .send(inputModelUser3)
        await request(app)
            .post('/auth/registration')
            .send(inputModelUser4)

        //Auth
        const auth_user_1 = await request(app).post('/auth/login')
            .set('user-agent', 'Mozilla')
            .send(correctInputModelAuth1)
        const auth_user_2 = await request(app).post('/auth/login')
            .set('user-agent', 'AppleWebKit')
            .send(correctInputModelAuth2)
        const auth_user_3 = await request(app).post('/auth/login')
            .set('user-agent', 'Chrome')
            .send(correctInputModelAuth3)
        const auth_user_4 = await request(app).post('/auth/login')
            .set('user-agent', 'Safari')
            .send(correctInputModelAuth4)

        tokens.token_user_1 = auth_user_1.body.accessToken;
        tokens.token_user_2 = auth_user_2.body.accessToken;
        tokens.token_user_3 = auth_user_3.body.accessToken;
        tokens.token_user_4 = auth_user_4.body.accessToken;

        let blog = await request(app)
            .post("/blogs")
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(BLOG_MODEL);

        let blogID = blog.body.id;

        post_1 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_1);
        postId1 = post_1.body.id;

        post_2 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_2);
        postId2 = post_2.body.id;

        post_3 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_3);
        postId3 = post_3.body.id;

        post_4 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_4);
        postId4 = post_4.body.id;

        post_5 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_5);
        postId5 = post_5.body.id;

        post_6 = await request(app)
            .post(`/blogs/${blogID}/posts`)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(POST_MODEL_6);
        postId6 = post_6.body.id
    })

    it("should posts length == 6", async () => {
        let response = await request(app).get(`/posts`);
        let posts = response.body;
        expect(posts.totalCount).toBe(6);
    })

    it("should two likes at first post", async () => {
        await request(app).put(`/posts/${postId1}/like-status`).set('Authorization', `Bearer ${tokens.token_user_1}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId1}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({likeStatus: TypesLikes.like});

        let response = await request(app).get(`/posts/${postId1}`);
        let post1 = response.body;
        expect(post1).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 2,
                    dislikesCount: 0,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-1'
                        }, 
                    ],
                }
            }
        )
    })

    it("should two likes at second post ", async () => {
        await request(app).put(`/posts/${postId2}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId2}/like-status`).set('Authorization', `Bearer ${tokens.token_user_3}`).send({likeStatus: TypesLikes.like});

        let response = await request(app).get(`/posts/${postId2}`);
        let post1 = response.body;
        expect(post1).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 2,
                    dislikesCount: 0,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-3'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        }, 
                    ],
                }
            }
        )
    })

    it("should one dislike at 3 post by user 1 ", async () => {
        await request(app).put(`/posts/${postId3}/like-status`).set('Authorization', `Bearer ${tokens.token_user_1}`).send({likeStatus: TypesLikes.dislike});

        let response = await request(app).get(`/posts/${postId3}`);
        let post3 = response.body;
        expect(post3).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: "None",
                    newestLikes: [],
                }
            }
        )
    })

    it("should 4 likes at post 4 ", async () => {
        await request(app).put(`/posts/${postId4}/like-status`).set('Authorization', `Bearer ${tokens.token_user_1}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId4}/like-status`).set('Authorization', `Bearer ${tokens.token_user_4}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId4}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId4}/like-status`).set('Authorization', `Bearer ${tokens.token_user_3}`).send({likeStatus: TypesLikes.like});

        let response = await request(app).get(`/posts/${postId4}`);
        let post1 = response.body;
        expect(post1).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 4,
                    dislikesCount: 0,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-3'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        }, 
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-4'
                        },  
                    ],
                }
            }
        )
    })

    it("should 1 like at 5 post and 1 dislike", async () => {
        await request(app).put(`/posts/${postId5}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({likeStatus: TypesLikes.like});
        await request(app).put(`/posts/${postId5}/like-status`).set('Authorization', `Bearer ${tokens.token_user_3}`).send({likeStatus: TypesLikes.dislike});

        let response = await request(app).get(`/posts/${postId5}`);
        let post1 = response.body;
        expect(post1).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        },
                    ],
                }
            }
        )
    })

    it("should 1 like at 6 post and 1 dislike", async () => {
        await request(app).put(`/posts/${postId6}/like-status`).set('Authorization', `Bearer ${tokens.token_user_1}`).send({ likeStatus: TypesLikes.like });
        await request(app).put(`/posts/${postId6}/like-status`).set('Authorization', `Bearer ${tokens.token_user_2}`).send({ likeStatus: TypesLikes.dislike });

        let response = await request(app).get(`/posts/${postId6}`);
        let post6 = response.body;
        expect(post6).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-1'
                        },
                    ],
                }
            }
        )
    })

    it("all post for user 1 login", async () => {
        let response1 = await request(app).get(`/posts/${postId1}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post1 = response1.body;
        expect(post1).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 2,
                    dislikesCount: 0,
                    myStatus: TypesLikes.like,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-1'
                        }, 
                    ],
                }
            }
        )

        let response2 = await request(app).get(`/posts/${postId2}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post2 = response2.body;
        expect(post2).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 2,
                    dislikesCount: 0,
                    myStatus: TypesLikes.none,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-3'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        }, 
                    ],
                }
            }
        )

        let response3 = await request(app).get(`/posts/${postId3}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post3 = response3.body;
        expect(post3).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 1,
                    myStatus: TypesLikes.dislike,
                    newestLikes: [],
                }
            }
        )

        let response4 = await request(app).get(`/posts/${postId4}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post4 = response4.body;
        expect(post4).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 4,
                    dislikesCount: 0,
                    myStatus: TypesLikes.like,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-3'
                        },
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        }, 
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-4'
                        }, 
                    ],
                }
            }
        )

        let response5 = await request(app).get(`/posts/${postId5}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post5 = response5.body;
        expect(post5).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: "None",
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-2'
                        },
                    ],
                }
            }
        )

        let response6 = await request(app).get(`/posts/${postId6}`).set('Authorization', `Bearer ${tokens.token_user_1}`);
        let post6 = response6.body;
        expect(post6).toStrictEqual(
            {
                id: expect.any(String),
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: TypesLikes.like,
                    newestLikes: [
                        {
                            addedAt: expect.any(String),
                            userId: expect.any(String),
                            login: 'login-1'
                        },
                    ],
                }
            }
        )
    })
})