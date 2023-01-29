import request from 'supertest'
import {app} from '../app'
import { runDB } from '../repositories/db'

const NEW_BLOG = {
    name: "Test in jest",
    websiteUrl: "https://www.youtube.com/watch?v=ZmVBCpefQe8&list=PL6ubUCP07zW7MsAfS5zoIKv-AcNvWQhf6&index=1",
    description: "JavaScript® (часто просто JS) — это легковесный"
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

    it('should delete all data', async () => {
        await request(app).delete('/testing/all-data').expect(204)
    })

    it('should return likes', async () => {
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

      
        let newBlog = await request(app)
            .post("/blogs")
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(NEW_BLOG)


    })

    // it('should delete device by deviceId', async () => {
    //     await request(app)
    //         .delete(`/security/devices/${deletedDeviceId}`).set('Cookie', cookie)

    //     const devices = await request(app)
    //         .get('/security/devices').set('Cookie', cookie)

    //     expect(devices.body.length).toBe(3)
    // })

    // it('should refresh-token', async () => {
    //     const result = await request(app).post('/auth/refresh-token').set('Cookie', cookie)

    //     expect(result.body).toStrictEqual({
    //         accessToken: expect.any(String)
    //     })
    // })

    // it('should return 404, if trying delete incorrect device by deviceId', async () => {
    //     await request(app)
    //         .delete(`/security/devices/${deletedDeviceId}`).set('Cookie', cookie).expect(404)

    //     const devices = await request(app)
    //         .get('/security/devices').set('Cookie', cookie)

    //     expect(devices.body.length).toBe(3)
    // })

    // it('should delete devices exept current device current user', async () => {
    //     await request(app)
    //         .delete('/security/devices').set('Cookie', cookie)

    //     const devices = await request(app)
    //         .get('/security/devices').set('Cookie', cookie)

    //     expect(devices.body.length).toBe(1)
    // })

    // it('should delete current device, if user logout', async () => {
    //     await request(app)
    //         .post('/auth/logout').set('Cookie', cookie)

    //     const devices = await request(app)
    //         .get('/security/devices').set('Cookie', cookie)

    //     expect(devices.body.length).toBe(0)
    // })

})