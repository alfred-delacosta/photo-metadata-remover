import sharp from 'sharp';

async function test() {
  try {
    const buffer = await sharp({ create: { width: 100, height: 100, channels: 3, background: 'red' } }).jpeg().toBuffer();
    console.log('Sharp works, buffer length:', buffer.length);
  } catch (err) {
    console.error('Sharp error:', err);
  }
}

test();