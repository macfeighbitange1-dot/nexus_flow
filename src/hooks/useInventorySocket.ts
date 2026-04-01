import { useEffect, useRef } from 'react';
import { createConsumer } from '@rails/actioncable';

// The 'ws://' tells the browser to open a persistent "Pipe" instead of a one-time request.
const consumer = createConsumer('ws://localhost:3000/cable');

export const useInventorySocket = (onUpdate: () => void) => {
  const onUpdateRef = useRef(onUpdate);

  // Keep the reference fresh so the WebSocket always calls the latest logic
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    console.log("Connecting to NexusFlow Real-Time Engine...");

    const subscription = consumer.subscriptions.create('InventoryChannel', {
      connected() {
        console.log("WebSocket: Online");
      },
      disconnected() {
        console.log("WebSocket: Offline");
      },
      received(data) {
        console.log("Broadcast received from Redis:", data);
        onUpdateRef.current(); // This triggers the UI refresh
      },
    });

    // Cleanup: Close the pipe when the browser tab is closed to save memory
    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
