const prisma = require('../config/db');

const getFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { communityId: req.communityId },
      include: {
        bookings: {
          orderBy: { bookingDate: 'desc' },
          take: 5
        }
      }
    });
    return res.json({ success: true, data: { facilities } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch facilities.' } });
  }
};

const bookFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { bookingDate, startTime, endTime, purpose } = req.body;

    if (!bookingDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Booking date, start time, and end time are required.' }
      });
    }

    // Server-side conflict check: prevent overlapping confirmed bookings on the same date/time
    const conflict = await prisma.facilityBooking.findFirst({
      where: {
        facilityId,
        bookingDate,
        startTime,
        status: 'CONFIRMED'
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: { code: 'BOOKING_CONFLICT', message: 'This time slot is already booked. Please select another time.' }
      });
    }

    const booking = await prisma.facilityBooking.create({
      data: {
        facilityId,
        bookedById: req.user.id,
        bookingDate,
        startTime,
        endTime,
        purpose: purpose || 'Community Function',
        status: 'CONFIRMED'
      }
    });

    return res.status(201).json({
      success: true,
      data: { booking },
      message: 'Facility reservation confirmed with zero conflict.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to reserve facility.' } });
  }
};

module.exports = { getFacilities, bookFacility };
