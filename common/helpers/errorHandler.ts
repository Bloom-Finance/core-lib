import Router from 'next/router'
interface IErrorHandler {
    NotFoundPage(): void
    UnderMaintenance(): void
}

export class ErrorHandler implements IErrorHandler {
    constructor(err: any) {
        switch (err) {
            case '404':
                this.NotFoundPage()
                break
            default:
                this.UnderMaintenance()
                break
        }
    }
    NotFoundPage(): void {
        Router.push('/error/notfound')
    }
    UnderMaintenance(): void {
        Router.replace('/maintenance')
    }
}
