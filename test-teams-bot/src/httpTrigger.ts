import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import notificationTemplatePost from "./adaptiveCards/notification-post.json";
import notificationModerationCreated from "./adaptiveCards/notification-moderation-created.json";
import notificationMemberInvitation from "./adaptiveCards/notification-member-invintation.json";
import notificationTemplateSpaceJoinRequestCreated from "./adaptiveCards/notification-space-join-request-created.json";
import notificationTemplateSpaceJoinRequestAccepted from "./adaptiveCards/notification-space-join-request-accepted.json";
import notificationMemberVerified from "./adaptiveCards/notification-member-verified.json";
import notificationModerationAR from "./adaptiveCards/notification-moderation-rejected-accepted.json";
import notificatonSpaceMembershipSelfDCS from "./adaptiveCards/notification-space-membership-deleted-created-self.json";
import notificationSpaceMemberShipDC from "./adaptiveCards/notification-space-membership-deleted-created.json";
import notificationWelcome from "./adaptiveCards/notification-welcome.json";
import { CardData } from "./cardModels";
import { notificationApp } from "./internal/initialize";
import { EventIds } from "./constents";

// An Azure Function HTTP trigger.
//
// This endpoint is provided by your application to listen to events. You can configure
// your IT processes, other applications, background tasks, etc - to POST events to this
// endpoint.
//
// In response to events, this function sends Adaptive Cards to Teams. You can update the logic in this function
// to suit your needs. You can enrich the event with additional data and send an Adaptive Card as required.
//
// You can add authentication / authorization for this API. Refer to
// https://aka.ms/teamsfx-notification for more details.
const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log("req: ", req.body.message);

  // for (const target of await notificationApp.notification.installations()) {
  //   await target.sendAdaptiveCard(
  //     AdaptiveCards.declare<CardData>(notificationTemplate).render({
  //       title: "New Event Occurred!",
  //       appName: "Contoso App Notification",
  //       description: `This is a sample http-triggered notification to ${target.type}`,
  //       notificationUrl: "https://aka.ms/teamsfx-notification-new",
  //     })
  //   );
  // }

  // const channels = await target.channels();
  //   for (const channel of channels) {
  //     console.log("channel: ", channel)
  //   }
  // Note - you can filter the installations if you don't want to send the event to every installation.

  /** For example, if the current target is a "Group" this means that the notification application is
     *  installed in a Group Chat.
    if (target.type === NotificationTargetType.Group) {
      // You can send the Adaptive Card to the Group Chat
      await target.sendAdaptiveCard(...);

      // Or you can list all members in the Group Chat and send the Adaptive Card to each Team member
      const members = await target.members();
      for (const member of members) {
        // You can even filter the members and only send the Adaptive Card to members that fit a criteria
        await member.sendAdaptiveCard(...);
      }
    }
    **/

  /** If the current target is "Channel" this means that the notification application is installed
     *  in a Team.
    if (target.type === NotificationTargetType.Channel) {
      // If you send an Adaptive Card to the Team (the target), it sends it to the `General` channel of the Team
      await target.sendAdaptiveCard(...);

      // Alternatively, you can list all channels in the Team and send the Adaptive Card to each channel
      const channels = await target.channels();
      for (const channel of channels) {
        await channel.sendAdaptiveCard(...);
      }

      // Or, you can list all members in the Team and send the Adaptive Card to each Team member
      const members = await target.members();
      for (const member of members) {
        await member.sendAdaptiveCard(...);
      }
    }
    **/

  /** If the current target is "Person" this means that the notification application is installed in a
     *  personal chat.
    if (target.type === NotificationTargetType.Person) {
      // Directly notify the individual person
      await target.sendAdaptiveCard(...);
    }
    **/
  context.res = {
    // status defaults to 200 */
    body: "Success sending message",
  };

  console.log(context.res, "context");
  // context.res = {};

  // res.header('Content-Type', 'application/json');

  console.log(req.body, "req.body");
  // const channel = await notificationApp.notification.findChannel((c) =>
  //   Promise.resolve(c.info.id === req.body.channelIds[0])
  // );
  // if (channel) {
  //   await channel.sendAdaptiveCard(
  //     AdaptiveCards.declare<CardData>(notificationTemplate).render({
  //       title: "Bettermode!",
  //       appName: "BetterMode App Notification",
  //       description: `${req.body.message}`,
  //       notificationUrl: "bettermode.com",
  //     })
  //   );
  // }
  notificationApp.notification.installations().then((targets) => {
    for (const target of targets) {
      //   console.log("target: ", target)
      //   // "Channel" means this bot is installed to a Team (default to notify General channel)
      //   if (target.type === "Channel") {
      //     // Directly notify the Team (to the default General channel)
      //     // await target.sendAdaptiveCard(...);

      //     // List all members in the Team then notify each member
      //     const members = await target.members();
      //     for (const member of members) {
      //       // await member.sendAdaptiveCard(...);
      //     }

      //     // List all channels in the Team then notify each channel

      target.channels().then((channels) => {
        for (const channel of channels) {
          if (req.body.channelIds.includes(channel.info.id)) {
            
            switch (req.body.mode) {
              case EventIds.WELCOME:
                  channel.sendAdaptiveCard(
                    AdaptiveCards.declare<CardData>(
                      notificationWelcome
                    ).render({
                      title: "Bettermode!",
                      appName: "BetterMode App Notification",
                      description: `${req.body.message}`,
                     
                     
                    })
                  );
                  break;


              case EventIds.POST_PUBLISHED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationTemplatePost
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    notificationUrl: `${
                      req.body.postUrl
                    }`,
                    viewUserUrl: `${req.body.userUrl}`,
                  })
                );
                console.log("channel: ", channel.info.id);
                break;
              case EventIds.MEMBER_INVITATION_CREATED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationMemberInvitation
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    actorUrl: `${
                      req.body.actorUrl 
                    }`,
                  })
                );
                break;
              case EventIds.MEMBER_VERIFIED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationMemberVerified
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    viewUserUrl: `${
                       req.body.userUrl
                    }`,
                  })
                );
                break;
              case EventIds.SPACE_JOIN_REQUEST_ACCEPTED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationTemplateSpaceJoinRequestCreated
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    spaceUrl: `${req.body.spaceUrl}`,
                    viewUserUrl: `${
                      req.body.actorUrl 
                    }`,
                  })
                );
                break;
              case EventIds.SPACE_JOIN_REQUEST_CREATED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationTemplateSpaceJoinRequestAccepted
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    spaceUrl: `${req.body.spaceUrl}`,
                    viewUserUrl: `${ req.body.actorUrl 
                    }`,
                    actorUrl: `${req.body.actorUrl}`,
                  })
                );

                break;
              case EventIds.MODERATION_CREATED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationModerationCreated
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    postUrl: `${req.body.postUrl}`,
                    viewUserUrl: `${req.body.userUrl}`,
                  })
                );
                break;
              case EventIds.MODERATION_REJECTED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationModerationAR
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    viewUserUrl: `${
                      req.body.actorUrl
                    }`,
                    actorUrl: `${req.body.actorUrl}`,
                  })
                );
                  break;
              case EventIds.MODERATION_ACCEPTED:
                channel.sendAdaptiveCard(
                  AdaptiveCards.declare<CardData>(
                    notificationModerationAR
                  ).render({
                    title: "Bettermode!",
                    appName: "BetterMode App Notification",
                    description: `${req.body.message}`,
                    viewUserUrl: `${
                      req.body.actorUrl
                    }`,
                    actorUrl: `${req.body.actorUrl}`,
                  })
                );
                  break;
              case EventIds.SPACE_MEMBERSHIP_DELETED:
                if(req.body.self){
                  channel.sendAdaptiveCard(
                    AdaptiveCards.declare<CardData>(
                      notificatonSpaceMembershipSelfDCS
                    ).render({
                      title: "Bettermode!",
                      appName: "BetterMode App Notification",
                      description: `${req.body.message}`,
                      viewUserUrl: `${
                        req.body.actorUrl 
                      }`,
                      spaceUrl: `${req.body.spaceUrl}`,
                    })
                  );

                }else{
                  channel.sendAdaptiveCard(
                    AdaptiveCards.declare<CardData>(
                      notificationSpaceMemberShipDC
                    ).render({
                      title: "Bettermode!",
                      appName: "BetterMode App Notification",
                      description: `${req.body.message}`,
                      viewUserUrl: `${
                        req.body.actorUrl 
                      }`,
                      spaceUrl: `${req.body.spaceUrl}`,
                      actorUrl: `${req.body.actorUrl}`,
                    }))

                }
                break
              case EventIds.SPACE_MEMBERSHIP_CREATED:
                
                  if(req.body.self){
                    channel.sendAdaptiveCard(
                      AdaptiveCards.declare<CardData>(
                        notificatonSpaceMembershipSelfDCS
                      ).render({
                        title: "Bettermode!",
                        appName: "BetterMode App Notification",
                        description: `${req.body.message}`,
                        viewUserUrl: `${
                          req.body.actorUrl 
                        }`,
                        spaceUrl: `${req.body.spaceUrl}`,
                      })
                    );
                }else{
                  channel.sendAdaptiveCard(
                    AdaptiveCards.declare<CardData>(
                      notificationSpaceMemberShipDC
                    ).render({
                      title: "Bettermode!",
                      appName: "BetterMode App Notification",
                      description: `${req.body.message}`,
                      viewUserUrl: `${
                        req.body.userUrl 
                      }`,
                      spaceUrl: `${req.body.spaceUrl}`,
                      actorUrl: `${req.body.actorUrl}`,
                    }))

                }
                break
            }
          }
        }
      });

      /** You can also find someone and notify the individual person
  const member = await notificationApp.notification.findMember(
    async (m) => m.account.email === "someone@contoso.com"
  );
  await member?.sendAdaptiveCard(...);
  **/

      /** Or find multiple people and notify them
  const members = await notificationApp.notification.findAllMembers(
    async (m) => m.account.email?.startsWith("test")
  );
  for (const member of members) {
    await member.sendAdaptiveCard(...);
  }
  **/
    }
  });
};
export default httpTrigger;
