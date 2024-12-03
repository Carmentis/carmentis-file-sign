// Represents the metadata and essential details about a transaction and the sender's document.
export interface Fields {
    /**
     * Unique identifier for the transaction.
     */
    transactionId: string;

    /**
     * Details about the sender's document.
     */
    senderDocument: {
        /**
         * Information about the file.
         */
        file: {
            /**
             * The name of the file.
             */
            name: string;

            /**
             * The size of the file in bytes.
             */
            size: number;

            /**
             * The CRC32 checksum of the file for integrity verification.
             */
            crc32: string;

            /**
             * The SHA-256 hash of the file for integrity verification.
             */
            sha256: string;
        };

        /**
         * The email address of the sender.
         */
        senderEmail: string;

        /**
         * The email address of the recipient.
         */
        recipientEmail: string;
    };
}

// Represents data required for preparing user approval workflows.
export interface PrepareUserApprovalData {
    /**
     * The application name associated with the approval request.
     */
    application: string;

    /**
     * The version of the application.
     */
    version: number;

    /**
     * Transaction-related fields.
     */
    fields: Fields;

    /**
     * List of actors involved in the approval process.
     */
    actors: {
        /**
         * The name of the actor.
         */
        name: string;
    }[];

    /**
     * Channels through which communication will occur.
     */
    channels: string[];

    /**
     * Subscription details for the sender and recipient.
     */
    subscriptions: {
        /**
         * List of sender subscriptions.
         */
        sender: string[];

        /**
         * List of recipient subscriptions.
         */
        recipient: string[];
    };

    /**
     * Permissions for different communication channels.
     */
    permissions: {
        /**
         * Permissions for the main channel.
         */
        mainChannel: string[];

        /**
         * Permissions for the sender's channel.
         */
        senderChannel: string[];

        /**
         * Permissions for the recipient's channel.
         */
        recipientChannel: string[];
    };

    /**
     * Approval-related information.
     */
    approval: {
        /**
         * The actor responsible for the approval.
         */
        actor: string;

        /**
         * The message or note associated with the approval.
         */
        message: string;
    };
}

// Represents the details of a transaction.
export interface Transaction {
    /**
     * Information about the application.
     */
    application: {
        /**
         * The unique identifier of the application.
         */
        id: string;

        /**
         * The version of the application.
         */
        version: number;
    };

    /**
     * Transaction-related fields.
     */
    field: Fields;

    /**
     * The filename of the document.
     */
    filename: string;

    /**
     * The path to the file in the system.
     */
    path: string;

    /**
     * The original name of the file.
     */
    originalName: string;

    /**
     * The record identifier for the transaction.
     */
    recordId: string;

    /**
     * Indicates whether the email has been sent.
     */
    mailSent: boolean;

    /**
     * The email address of the sender.
     */
    senderEmail: string;

    /**
     * The email address of the recipient.
     */
    recipientEmail: string;

    /**
     * Optional identifier for the flow associated with the transaction.
     */
    flowId?: string;
}
