async function onLoad() {
    Carmentis.registerNodeEndpoint('https://node.testapps.carmentis.io');
    Carmentis.registerDataEndpoint('https://data.testapps.carmentis.io');

    // load the identifier
    const id = document.getElementById('id').value;
    const applicationId = document.getElementById('appId').value;

    let answer = await Carmentis.wallet.request({
        qrElementId: 'qr', // QRCode identifier
        type: 'eventApproval',
        applicationId: applicationId,
        data: {
            id: id,
        },
        allowReconnection: false,
        operatorURL: 'https://testapps.carmentis.io',
    });

    if (answer.success) {
        // on success, we redirect to the success page
        window.location = `/review/success`;
    } else {
        // on error, we redirect to the error page
        console.log('Error...', answer);
        window.location = '/error';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    onLoad();
});
