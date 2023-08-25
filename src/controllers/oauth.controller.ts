import { connectToMicrosoft } from '@/logics/oauth.logic'
import { consumerExtractorMiddleware, middleMicrosoft } from '@middlewares'
import { globalLogger } from '@utils'
import { Request, Response } from 'express'
import { Controller, Get, HttpCode, Req, Res, UseBefore } from 'routing-controllers'
import { OpenAPI } from 'routing-controllers-openapi'
// import { redirect } from '@middlewares'
@Controller('/oauth')
export class OAuthController {
  readonly logger = globalLogger.setContext(OAuthController.name)

  @Get()
  @UseBefore(consumerExtractorMiddleware,middleMicrosoft)
  @OpenAPI({ summary: 'Redirects to the microsoft for authorization.' })
  @HttpCode(302)
  async redirect(@Req() req: Response): Promise<void> {}

  @Get('/redirect')
  @UseBefore(consumerExtractorMiddleware,middleMicrosoft)
  @OpenAPI({ summary: 'Redirects to the app settings page after authentication.' })
  @HttpCode(302)
  async callback(@Req() request: Request, @Res() response: Response): Promise<Response> {
    this.logger.verbose('Received oauth callback request', {
      user: request.user,
      state: request.state,
    })

    await connectToMicrosoft({
      authInfo: request.user,
      state: request.state,
    })
    response.redirect("https://login.microsoftonline.com/organizations/adminconsent?client_id=071cabf4-ed93-4d87-ad6a-1ad0cba2c1bf")
    // response.redirect("https://internship2023.bettermode.io/manage/apps/microsoft-teams")

    // response.redirect(request.state.redirectUrl)
    return response
  }
  @Get('/application')
  async application(@Req() request: Request, @Res() response: Response): Promise<Response> {
     this.logger.verbose('Received application oauth callback request')
      response.redirect("https://internship2023.bettermode.io/manage/apps/microsoft-plugin-dev")
      return response
  }
}




