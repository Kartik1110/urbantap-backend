import cron from 'node-cron';
import { PrismaClient, Listing, Broker, User, Notification, Admin_Status, NotificationType } from '@prisma/client';
import { sendPushNotification, sendMulticastPushNotification, PushNotificationData } from '../services/firebase.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ListingWithBroker extends Listing {
  broker: BrokerWithUser | null;
}

interface BrokerWithUser extends Broker {
  user: User | null;
}

async function approveListings(): Promise<void> {
  try {
    // Get all pending listings with their brokers
    const pendingListings = await prisma.listing.findMany({
      where: {
        admin_status: Admin_Status.Pending
      },
      include: {
        broker: {
          include: {
            user: true
          }
        }
      }
    }) as ListingWithBroker[];

    for (const listing of pendingListings) {
      // Update listing status to Approved
      await prisma.listing.update({
        where: { id: listing.id },
        data: { admin_status: Admin_Status.Approved }
      });

      // Send notification to listing creator
      if (listing.broker?.user?.fcm_token) {
        const creatorNotification: PushNotificationData = {
          token: listing.broker.user.fcm_token,
          title: 'Listing Approved',
          body: 'Your Listing has been approved',
          data: {
            listingId: listing.id,
            type: 'LISTING_APPROVAL'
          }
        };
        await sendPushNotification(creatorNotification);
      }

      // //Sends Listings notifications to all brokers
      // const firstName = listing.broker?.user?.name || 'Someone';
      // const listingType = listing.sale_type?.toLowerCase() || 'property';
      // const locationRaw = listing.address || listing.city || 'a location';
      // const priceValue = listing.min_price || listing.max_price || null;
      // const price = priceValue
      //   ? `AED ${priceValue.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`
      //   : 'a great price';
      // const location = locationRaw
      //   .split(' ')
      //   .slice(0, 5)
      //   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      //   .join(' ');
      // const formattedBody = `${firstName} just listed a ${listingType} in ${location} for ${price} only! Check it out before someone else grabs it!`;

      // const otherBrokers = await prisma.broker.findMany({
      //   where: {
      //     NOT: { id: listing.broker_id }
      //   },
      //   include: { user: true }
      // }) as BrokerWithUser[];

      // const notifications: PushNotificationData[] = otherBrokers
      //   .filter((broker): broker is BrokerWithUser & { user: User & { fcm_token: string } } =>
      //     Boolean(broker.user?.fcm_token)
      //   )
      //   .map(broker => ({
      //     token: broker.user.fcm_token,
      //     title: 'New Listing Alert',
      //     body: formattedBody,
      //     data: {
      //       listingId: listing.id,
      //       type: 'NEW_LISTING_ALERT'
      //     }
      //   }));

      // if (notifications.length > 0) {
      //   await sendMulticastPushNotification(notifications);
      // }

      // const notificationPromises = otherBrokers.map(broker =>
      //   prisma.notification.create({
      //     data: {
      //       broker_id: broker.id,
      //       sent_by_id: listing.broker_id,
      //       text: formattedBody,
      //       type: NotificationType.General,
      //       listing_id: listing.id
      //     }
      //   })
      // );

      // await Promise.all(notificationPromises);
    }
    logger.info(`Successfully processed ${pendingListings.length} pending listings`);
  } catch (error) {
    logger.error('Error in approveListings cron job:', error instanceof Error ? error.message : String(error));
  }
}

async function sendHourlyListingNotifications(): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();

  const listings = await prisma.listing.findMany({
    where: {
      admin_status: 'Approved',
      created_at: {
        gte: oneHourAgo,
        lt: now
      }
    },
    select: {
      address: true,
      city: true
    }
  });

  if (listings.length === 0) {
    logger.info('No new listings found in the last hour.');
    return;
  }

  const locations = Array.from(new Set(
    listings.map(listing =>
      (listing.address || listing.city || '')
        .split(',')[0]
        .trim()
    ).filter(Boolean)
  ));

  const topLocations = locations.slice(0, 3);
  const remainingCount = locations.length - topLocations.length;

  const messageBody = `There are new listings posted on ${topLocations.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} more locations` : ''}.`;

  logger.info('Notification text:', messageBody);

  const brokers = await prisma.broker.findMany({
    where: {
      user: {
        fcm_token: {
          not: null
        }
      }
    },
    include: {
      user: true
    }
  });

  const notifications: PushNotificationData[] = brokers.map(broker => ({
    token: broker.user!.fcm_token!,
    title: 'New Listings Alert',
    body: messageBody,
    data: {
      type: 'HOURLY_LISTING_UPDATE'
    }
  }));

  const SYSTEM_USER_ID = "system";

  if (notifications.length > 0) {
    await sendMulticastPushNotification(notifications);


    await Promise.all(
      brokers.map(broker =>
        prisma.notification.create({
          data: {
            broker_id: broker.id,
            sent_by_id: SYSTEM_USER_ID,
            text: messageBody,
            type: NotificationType.General
          }
        })
      )
    );
  }

  logger.info(`Hourly notification sent to ${brokers.length} brokers`);
}

// Schedule the cron job to run every 12 hours
// Runs at every 30 minutes
cron.schedule('*/15 * * * *', async () => {
  logger.info('Running listing approval cron job...');
  await approveListings();
});

//Cron job runs from 11am - 9pm GST, once in every hour
cron.schedule(
  '0 11-21 * * *',
  async () => {
    logger.info('Running hourly listing summary cron job...');
    await sendHourlyListingNotifications();
  },
  {
    timezone: 'Asia/Dubai' 
  }
);

export {
  approveListings,
  sendHourlyListingNotifications
};
