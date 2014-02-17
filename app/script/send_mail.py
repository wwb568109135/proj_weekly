# coding=utf-8
#!/usr/bin/env python

#@brief : send the email
#@author : nelsonli

import traceback
import os
import sys
import commands

'''
from scripts.util.tof2lib import TencentMail, MessageHelper, TencentMailAttachment
from scripts.util.tof2lib import send_email_msg, send_sms_msg, send_rtx_msg 
from scripts.util import common
from conf import mms_conf
'''

from tof2lib import TencentMail, MessageHelper, TencentMailAttachment
from tof2lib import send_email_msg, send_sms_msg, send_rtx_msg 

def send_alarm(title, msg):
    send_email_msg('nelsonli@tencent.com', title, msg)
    send_sms_msg('18682150157', title + ',' + msg) 
    send_rtx_msg('nelsonli', title, msg)


def main():
    try:
        if len(sys.argv) < 4:
            print "param err"
            return False
        else:
             to = sys.argv[1]
             title = sys.argv[2]
             content = sys.argv[3]

        mail = TencentMail()
        mail.From = 'WEEKLY'
        msghelper = MessageHelper("d5bbf8c146b944d49452b1003776b2e4")    
        mail.To = to
        #mail.CC = "nelsonli" + "@tencent.com"
        mail.Title = title.decode('utf-8')
        mail.Content = content.decode('utf-8')
        #mail.Attachments.append(TencentMailAttachment(result_file))                
        msghelper.send(mail)
        return True

    except Exception, e:
        msg = traceback.format_exc()
        print msg
        return False

if __name__ == "__main__":   
    main()
    