"use strict";

var nonApprovedGroupName,
    approvedGroupName;

    socket.emit('admin.settings.get', {
            hash: 'newuser-approval' }, function(err, values) { 
                if (err) {
                    console.log('Unable to load settings');
                    
                } else {
                    nonApprovedGroupName = values.nonapprovedUserGroup;
                    approvedGroupName = values.approvedUserGroup;
                }

    });

require(['settings'], function(Settings) {
    Settings.load('newuser-approval', $('.newuser-approval-settings'));

    $('#save').on('click', function() {
        Settings.save('newuser-approval', $('.newuser-approval-settings'), function() {
            app.alert({
                type: 'success',
                alert_id: 'newuser-approval-saved',
                title: 'Settings Saved',
                message: 'Click here to reload NodeBB',
                timeout: 2500,
                clickfn: function() {
                    socket.emit('admin.reload');
                }
            });
        });
    });
});

$('#users-container').on('click', 'div[data-uid]', function() {
    var uid = $(this).attr('data-uid');
    socket.emit('admin.groups.join', { 
                groupName: approvedGroupName,
                uid: uid
            }, function(err, data) {
                if (!err) {
                    socket.emit('admin.groups.leave', {
                        groupName: nonApprovedGroupName,
                        uid: uid
                    }, function(err, data) {
                        if (!err) {
                            $('#users-container').find('div[data-uid="' + uid + '"]').parents('.users-box').remove();
                        }
                    });			
        }
    });
});

$(document).ready(function() {
    $(window).on('action:ajaxify.end', function(event, data) {

        socket.emit('admin.settings.get', {
                hash: 'newuser-approval' }, function(err, values) { 
                    if (err) {
                        console.log('Unable to load settings');
                        
                    } else {
                        socket.emit('admin.groups.get', values.nonapprovedUserGroup, function(err, data) {
                            $('#users-container').empty();
                            if (data.members.length > 0) {
                                for (var x = 0; x < data.members.length; x++) {
                                    var html = $('<div />')
                                        .attr('class', 'users-box')
                                        .append($('<div />').attr('class', 'user-image').attr('data-uid', data.members[x].uid)
                                        .attr('data-username', data.members[x].username).append($('<img />').attr('src', data.members[x].picture).attr('class', 'img-thumbnail user-selectable selection')))
                                        .append($('<a />').attr('href', '/user/'+data.members[x].username).attr( 'target', '_blank').html(data.members[x].username));
                                    $('#users-container').append(html);
                                }
                            }
                        });
                    }

        });
    });
});