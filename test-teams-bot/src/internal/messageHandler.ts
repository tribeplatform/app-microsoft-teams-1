import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { TeamsBot } from "../teamsBot";
import { notificationApp } from "./initialize";
import { ResponseWrapper } from "./responseWrapper";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  const res = new ResponseWrapper(context.res);
  res.status(201)
  res.send(req.body)
  // const teamsBot = new TeamsBot();
  //  notificationApp.requestHandler(req, res, async (context) => {
  //    teamsBot.run(context);
     
  // });
  console.log("req: ", req.body)
// return res;
};

export default httpTrigger;
