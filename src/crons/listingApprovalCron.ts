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

    }

      logger.info(`Successfully processed ${pendingListings.length} pending listings`);
    } catch (error) {
      logger.error('Error in approveListings cron job:', error instanceof Error ? error.message : String(error));
    }
  }
  
  async function sendHourlyListingNotifications(): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();

  const recentListings = await prisma.listing.findMany({
    where: {
      admin_status: 'Approved',
      created_at: {
        gte: oneHourAgo,
        lt: now
      }
    },
    include: {
      broker: {
        include: {
          user: true
        }
      }
    }
  });

  if (recentListings.length === 0) {
    logger.info('No new listings found in the last hour.');
    return;
  }

  // Pick one random listing
  const randomIndex = Math.floor(Math.random() * recentListings.length);
  const listing = recentListings[randomIndex];

  const firstName = listing.broker?.user?.name || 'Someone';
  const listingType = listing.sale_type?.toLowerCase() || 'property';
 const rawAddress = listing.address || listing.city || 'a location';
  const cleanedAddress = rawAddress
    .replace(/\s*-\s*United Arab Emirates\s*$/i, '')
    .trim();
  const location = cleanedAddress;
  const priceValue = listing.min_price || listing.max_price || null;
  const price = priceValue ? `AED ${priceValue.toLocaleString('en-AE', { maximumFractionDigits: 0 })}` : 'a great price';


  const messageBody = `${firstName} just listed a ${listingType} space in ${location} for ${price} only! Check it out before someone else grabs it!`;

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
    title: 'New Listing Alert!',
    body: messageBody,
    data: {
      listingId: listing.id,
      type: 'NEW_LISTING_ALERT'
    }
  }));

  const SYSTEM_USER_ID = "system";

  if (notifications.length > 0) {
    await sendMulticastPushNotification(notifications);

    await prisma.notification.create({
      data: {
         sent_by_id: listing.broker_id,
          text: messageBody,
          type: NotificationType.Broadcast,
          listing_id: listing.id,
          broker_id: listing.broker_id
      },
    });
  }

  logger.info(`Hourly listing notification sent to ${brokers.length} brokers`);
}

  
  // Schedule the cron job to run every 12 hours
  // Runs at every 30 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running listing approval cron job...');
    await approveListings();
  });
  
  
  // Cron job runs from 11am - 9pm GST, once in every hour
  cron.schedule(
    '0 11-21 * * *',
    async () => {
      logger.info('Running hourly listing summary cron job...');
      await sendHourlyListingNotifications();
      logger.info(`Running on instance ${process.pid}`);
    },
    {
      timezone: 'Asia/Dubai' 
    }
  );
 
  export {
    approveListings, // Export for testing purposes
    sendHourlyListingNotifications
  
  }; 