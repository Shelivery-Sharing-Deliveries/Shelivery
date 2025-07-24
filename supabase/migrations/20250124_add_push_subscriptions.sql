-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions" ON public.push_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to send push notifications via Edge Function
CREATE OR REPLACE FUNCTION public.send_push_notification()
RETURNS TRIGGER AS $$
DECLARE
    request_id bigint;
    payload json;
BEGIN
    -- Only send push notifications if there are subscriptions for this user
    IF EXISTS (SELECT 1 FROM public.push_subscriptions WHERE user_id = NEW.user_id) THEN
        -- Prepare the payload for the edge function
        payload := json_build_object(
            'id', NEW.id,
            'title', NEW.title,
            'message', NEW.message,
            'type', COALESCE(NEW.type, 'info'),
            'chatroom_id', NEW.chatroom_id,
            'user_id', NEW.user_id
        );

        -- Call the edge function asynchronously using pg_net
        SELECT net.http_post(
            url := (SELECT CONCAT(current_setting('app.supabase_url'), '/functions/v1/send-push-notification')),
            headers := json_build_object(
                'Content-Type', 'application/json',
                'Authorization', CONCAT('Bearer ', current_setting('app.service_role_key'))
            ),
            body := payload::text
        ) INTO request_id;

        -- Log the request for debugging
        RAISE LOG 'Push notification edge function called with request_id: %, payload: %', request_id, payload;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the notification insert
        RAISE LOG 'Error calling push notification edge function: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send push notifications when notifications are inserted
CREATE OR REPLACE TRIGGER trigger_send_push_notification
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.send_push_notification();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
