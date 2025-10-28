/**
 * Configuration interface for iframe embedding
 */
export interface IframeConfig {
  /** The URL to load in the iframe */
  url: string;
  /** Accessible title for the iframe */
  title: string;
  /** Height of the iframe (can be px string or number) */
  height?: string | number;
  /** Allow fullscreen mode */
  allowFullscreen?: boolean;
  /** Sandbox permissions array */
  sandbox?: string[];
}

/**
 * Message interface for postMessage communication between iframe and parent
 */
export interface IframeMessage {
  /** Type of message being sent */
  type: string;
  /** Payload data */
  payload: any;
  /** Timestamp when message was sent */
  timestamp: number;
  /** Source identifier */
  source: string;
}

/**
 * State interface for iframe component
 */
export interface IframeState {
  /** Whether iframe is currently loading */
  loading: boolean;
  /** Error object if loading failed */
  error: Error | null;
  /** Whether iframe has successfully loaded */
  loaded: boolean;
}
